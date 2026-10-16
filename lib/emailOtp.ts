import "server-only";
import { randomInt } from "crypto";
import { hmac, safeEqual } from "@/lib/session";
import { sendMail } from "@/lib/mailer";

export type OtpPurpose = "mfa-setup" | "mfa-login";

interface OtpRecord {
  hash: string;
  expiresAt: number;
  sentAt: number;
  attempts: number;
}

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

const globalForOtp = globalThis as typeof globalThis & { __fkEmailOtps?: Map<string, OtpRecord> };
const otps = (globalForOtp.__fkEmailOtps ??= new Map());

const keyFor = (userId: string, purpose: OtpPurpose) => `${purpose}:${userId}`;

export class OtpError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export async function sendEmailOtp(userId: string, email: string, purpose: OtpPurpose) {
  const key = keyFor(userId, purpose);
  const existing = otps.get(key);
  if (existing && Date.now() - existing.sentAt < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.sentAt)) / 1000);
    throw new OtpError(`Please wait ${wait}s before requesting another code.`, 429);
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  otps.set(key, { hash: hmac(`${key}:${code}`), expiresAt: Date.now() + OTP_TTL_MS, sentAt: Date.now(), attempts: 0 });

  await sendMail({
    to: email,
    subject: "Your Funky Kids ERP verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes. If you didn't try to sign in, you can ignore this email.`,
    html: `<p>Your verification code is</p><p style="font-size:28px;font-weight:600;letter-spacing:6px">${code}</p><p>It expires in 10 minutes. If you didn't try to sign in, you can ignore this email.</p>`,
  });
}

export function verifyEmailOtp(userId: string, purpose: OtpPurpose, code: string) {
  const key = keyFor(userId, purpose);
  const record = otps.get(key);
  if (!record || record.expiresAt < Date.now()) {
    otps.delete(key);
    throw new OtpError("This code has expired. Request a new one.");
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    otps.delete(key);
    throw new OtpError("Too many incorrect attempts. Request a new code.", 429);
  }
  if (!safeEqual(record.hash, hmac(`${key}:${code}`))) {
    record.attempts += 1;
    throw new OtpError("That code is incorrect.");
  }
  otps.delete(key);
}
