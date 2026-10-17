import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ErpApiError, ErpNotConfiguredError } from "@/lib/erpApi";
import { getAuth, isDevLoginUser, toPublicUser } from "@/lib/userStore";
import type { AuthUser } from "@/types/auth";

export const SESSION_COOKIE_NAME = "fk_session";
export const MFA_COOKIE_NAME = "fk_mfa";
const MFA_TTL_SECONDS = 10 * 60;
// How long a confirmed session is trusted before asking the ERP backend again whether the
// account is still active and hasn't been signed out (deactivated, password reset, force logout).
const SESSION_RECHECK_MS = 30 * 1000;

interface SessionPayload {
  user: AuthUser;
  sessionVersion: number;
  issuedAt: number;
  expiresAt: number;
}

export interface MfaPendingPayload {
  userId: string;
  remember: boolean;
  emailVerified: boolean;
  expiresAt: number;
}

const globalForAuth = globalThis as typeof globalThis & {
  __fkDevAuthSecret?: string;
  __fkSessionChecks?: Map<string, { user: AuthUser | null; checkedAt: number }>;
};
const sessionChecks = (globalForAuth.__fkSessionChecks ??= new Map());

function authSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production.");
  }
  if (!globalForAuth.__fkDevAuthSecret) {
    // A throwaway key means every restart signs everyone out ("Remember me" can't work).
    console.warn("[auth] AUTH_SECRET is not set: using a temporary key, so logins won't survive a server restart. Add AUTH_SECRET to .env (see .env.example).");
    globalForAuth.__fkDevAuthSecret = randomBytes(32).toString("hex");
  }
  return globalForAuth.__fkDevAuthSecret;
}

export function hmac(value: string): string {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(body)}`;
}

function verify<T extends { expiresAt: number }>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, hmac(body))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

function sessionMaxAge(remember: boolean) {
  return remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function startSession(user: AuthUser, remember: boolean, sessionVersion: number) {
  const maxAge = sessionMaxAge(remember);
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    sign({ user, sessionVersion, issuedAt: Date.now(), expiresAt: Date.now() + maxAge * 1000 } satisfies SessionPayload),
    cookieOptions(maxAge),
  );
  cookieStore.delete(MFA_COOKIE_NAME);
  sessionChecks.delete(`${user.id}:${sessionVersion}`);
}

/** The account as it is now, or null once it was deactivated, deleted or signed out everywhere. */
async function currentUser(session: SessionPayload): Promise<AuthUser | null> {
  if (isDevLoginUser(session.user.id)) return session.user;
  const key = `${session.user.id}:${session.sessionVersion}`;
  const cached = sessionChecks.get(key);
  if (cached && Date.now() - cached.checkedAt < SESSION_RECHECK_MS) return cached.user;

  let user: AuthUser | null;
  try {
    const found = await getAuth(session.user.id);
    user = found && found.user.status === "active" && found.auth.sessionVersion === session.sessionVersion ? toPublicUser(found.user) : null;
  } catch (err) {
    // ERP backend unreachable: keep the signed session (every data request needs the backend anyway).
    if (err instanceof ErpNotConfiguredError || (err instanceof ErpApiError && err.status >= 500)) return session.user;
    throw err;
  }
  if (sessionChecks.size > 1000) sessionChecks.clear();
  sessionChecks.set(key, { user, checkedAt: Date.now() });
  return user;
}

/** Makes the next request re-check this user's sessions (after an admin changed the account). */
export function forgetSessionChecks(userId: string) {
  for (const key of sessionChecks.keys()) if (key.startsWith(`${userId}:`)) sessionChecks.delete(key);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const session = verify<SessionPayload>(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  return session && typeof session.sessionVersion === "number" ? currentUser(session) : null;
}

export async function setMfaPending(payload: Omit<MfaPendingPayload, "expiresAt">) {
  const cookieStore = await cookies();
  cookieStore.set(
    MFA_COOKIE_NAME,
    sign({ ...payload, expiresAt: Date.now() + MFA_TTL_SECONDS * 1000 } satisfies MfaPendingPayload),
    cookieOptions(MFA_TTL_SECONDS),
  );
}

export async function getMfaPending(): Promise<MfaPendingPayload | null> {
  const cookieStore = await cookies();
  return verify<MfaPendingPayload>(cookieStore.get(MFA_COOKIE_NAME)?.value);
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(MFA_COOKIE_NAME);
}
