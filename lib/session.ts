import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { AuthUser } from "@/types/auth";

export const SESSION_COOKIE_NAME = "fk_session";
export const MFA_COOKIE_NAME = "fk_mfa";
const MFA_TTL_SECONDS = 10 * 60;

interface SessionPayload {
  user: AuthUser;
  issuedAt: number;
  expiresAt: number;
}

export interface MfaPendingPayload {
  userId: string;
  remember: boolean;
  emailVerified: boolean;
  expiresAt: number;
}

const globalForAuth = globalThis as typeof globalThis & { __fkDevAuthSecret?: string };

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

export async function startSession(user: AuthUser, remember: boolean) {
  const maxAge = sessionMaxAge(remember);
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    sign({ user, issuedAt: Date.now(), expiresAt: Date.now() + maxAge * 1000 } satisfies SessionPayload),
    cookieOptions(maxAge),
  );
  cookieStore.delete(MFA_COOKIE_NAME);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  return verify<SessionPayload>(cookieStore.get(SESSION_COOKIE_NAME)?.value)?.user ?? null;
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
