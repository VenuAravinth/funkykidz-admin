import "server-only";
import type { AuthUser } from "@/types/auth";

interface MockUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  mfaSecret: string | null;
  mfaPendingSecret: string | null;
  lastTotpStep: number;
}

const globalForUsers = globalThis as typeof globalThis & { __fkMockUsers?: Map<string, MockUser> };

function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64");
}

function newUser(id: string, name: string, email: string, password: string): MockUser {
  return {
    id,
    name,
    email,
    passwordHash: hashPassword(password),
    mfaSecret: null,
    mfaPendingSecret: null,
    lastTotpStep: 0,
  };
}

function seed() {
  const users = new Map<string, MockUser>();
  const email = "demo@funkykids.com";
  users.set(email, newUser("usr_demo_1", "Demo User", email, "Passw0rd!"));
  return users;
}

const users = (globalForUsers.__fkMockUsers ??= seed());

export function findUserByEmail(email: string): MockUser | undefined {
  return users.get(email.toLowerCase());
}

export function findUserById(id: string): MockUser | undefined {
  return [...users.values()].find((user) => user.id === id);
}

export function verifyPassword(user: MockUser, password: string): boolean {
  return user.passwordHash === hashPassword(password);
}

export function createUser(input: { name: string; email: string; password: string }): MockUser {
  const email = input.email.toLowerCase();
  const user = newUser(`usr_${Date.now()}`, input.name, email, input.password);
  users.set(email, user);
  return user;
}

export function isMfaEnabled(user: MockUser): boolean {
  return Boolean(user.mfaSecret);
}

export function toPublicUser(user: MockUser): AuthUser {
  return { id: user.id, name: user.name, email: user.email };
}
