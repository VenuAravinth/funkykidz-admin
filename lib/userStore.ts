import "server-only";
import { createHash, timingSafeEqual } from "crypto";
import { ErpApiError, erpRequest } from "@/lib/erpApi";
import type { AuthUser } from "@/types/auth";
import type { User } from "@/types/user";
import type { UserCreateInput, UserEditInput } from "@/features/users/schema";

// ERP login accounts live in the ERP backend (`/api/v1/users`, MongoDB). The backend hashes and
// checks passwords; this server runs the sign-in steps and stores their progress there, so they
// survive restarts and work across server instances.

export interface EmailOtpRecord {
  purpose: string;
  hash: string;
  expiresAt: number;
  sentAt: number;
  attempts: number;
}

export interface MfaState {
  secret?: string | null;
  pendingSecret?: string | null;
  lastStep?: number;
  failures?: { count: number; resetAt: number } | null;
}

export interface AuthState {
  sessionVersion: number;
  mfa: MfaState;
  emailOtp: EmailOtpRecord | null;
}

export interface UserWithAuth {
  user: User;
  auth: AuthState;
}

// Development-only demo login (`next dev`): signs straight in, with no email code or authenticator,
// and never touches the ERP backend or the mail settings. Disabled in every other environment.
const DEV_LOGIN = { email: "demo@funkykids.com", password: "Passw0rd!" };
const DEV_USER: AuthUser = { id: "dev_demo", name: "Demo User", email: DEV_LOGIN.email, roleId: "role_administrator" };

const isDevelopment = () => process.env.NODE_ENV === "development";
const digest = (value: string) => createHash("sha256").update(value).digest();

/**
 * In development, the outcome for the demo email: the demo user, or null for a wrong password.
 * Undefined for any other email or environment (normal sign-in applies).
 */
export function devLogin(email: string, password: string): AuthUser | null | undefined {
  if (!isDevelopment() || !timingSafeEqual(digest(email), digest(DEV_LOGIN.email))) return undefined;
  return timingSafeEqual(digest(password), digest(DEV_LOGIN.password)) ? DEV_USER : null;
}

export function isDevLoginUser(id: string): boolean {
  return isDevelopment() && id === DEV_USER.id;
}

export function authenticate(email: string, password: string) {
  return erpRequest<UserWithAuth>("/users/authenticate", { method: "POST", body: { email, password } });
}

/** The account and its sign-in state, or null when it no longer exists. */
export async function getAuth(id: string): Promise<UserWithAuth | null> {
  try {
    return await erpRequest<UserWithAuth>(`/users/${id}/auth`);
  } catch (err) {
    if (err instanceof ErpApiError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
}

export function updateAuth(id: string, patch: { mfa?: MfaState; emailOtp?: EmailOtpRecord | null; recordLogin?: boolean }) {
  return erpRequest<UserWithAuth>(`/users/${id}/auth`, { method: "PATCH", body: patch });
}

export function isMfaEnabled(auth: AuthState): boolean {
  return Boolean(auth.mfa.secret);
}

export function toPublicUser(user: User): AuthUser {
  return { id: user.id, name: user.username, email: user.email, roleId: user.roleId };
}

export async function listUsers(): Promise<User[]> {
  const items: User[] = [];
  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const res = await erpRequest<{ items: User[]; totalPages: number }>("/users", { query: { page, limit: 200 } });
    items.push(...res.items);
    totalPages = res.totalPages;
  }
  return items;
}

export async function createUser(input: UserCreateInput, actor: string) {
  const { username, email, password, roleId, status, staffId } = input;
  const body = { username, email, password, roleId, status, staffId: staffId ?? "" };
  return (await erpRequest<{ user: User }>("/users", { method: "POST", body, actor })).user;
}

export async function updateUser(id: string, input: Partial<UserEditInput>, actor: string) {
  return (await erpRequest<{ user: User }>(`/users/${id}`, { method: "PATCH", body: input, actor })).user;
}

export async function setUserPassword(id: string, password: string, actor: string) {
  return (await erpRequest<{ user: User }>(`/users/${id}/password`, { method: "PUT", body: { password }, actor })).user;
}

export async function signOutUser(id: string, actor: string) {
  return (await erpRequest<{ user: User }>(`/users/${id}/sign-out`, { method: "POST", actor })).user;
}
