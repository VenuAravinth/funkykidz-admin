import "server-only";
import { randomInt } from "crypto";
import { hmac, safeEqual } from "@/lib/session";
import { sendMail } from "@/lib/mailer";
import { updateAuth, type EmailOtpRecord } from "@/lib/userStore";

export type OtpPurpose = "mfa-setup" | "mfa-login";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

// Only a keyed hash of the code is stored (with the user, in the ERP backend), bound to the
// user and purpose, so a code for one step can't be replayed in another.
const hashFor = (userId: string, purpose: OtpPurpose, code: string) => hmac(`${purpose}:${userId}:${code}`);

export class OtpError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export async function sendEmailOtp(user: { id: string; email: string }, current: EmailOtpRecord | null, purpose: OtpPurpose) {
  if (current && Date.now() - current.sentAt < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - current.sentAt)) / 1000);
    throw new OtpError(`Please wait ${wait}s before requesting another code.`, 429);
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const now = Date.now();
  await updateAuth(user.id, {
    emailOtp: { purpose, hash: hashFor(user.id, purpose, code), expiresAt: now + OTP_TTL_MS, sentAt: now, attempts: 0 },
  });

  try {
    await sendMail({
      to: user.email,
      subject: "Your Funky Kids ERP verification code",
      text: `Your verification code is ${code}. It expires in 10 minutes. If you didn't try to sign in, you can ignore this email.`,
      html: `<p>Your verification code is</p><p style="font-size:28px;font-weight:600;letter-spacing:6px">${code}</p><p>It expires in 10 minutes. If you didn't try to sign in, you can ignore this email.</p>`,
    });
  } catch (err) {
    // The code never arrived: drop it so the user can ask again straight away.
    await updateAuth(user.id, { emailOtp: null }).catch(() => undefined);
    throw err;
  }
}

export async function verifyEmailOtp(userId: string, current: EmailOtpRecord | null, purpose: OtpPurpose, code: string) {
  if (!current || current.purpose !== purpose) {
    throw new OtpError("No code is waiting for verification. Request a new one.");
  }
  if (current.expiresAt < Date.now()) {
    await updateAuth(userId, { emailOtp: null });
    throw new OtpError("This code has expired. Request a new one.");
  }
  if (current.attempts >= MAX_ATTEMPTS) {
    await updateAuth(userId, { emailOtp: null });
    throw new OtpError("Too many incorrect attempts. Request a new code.", 429);
  }
  if (!safeEqual(current.hash, hashFor(userId, purpose, code))) {
    const attempts = current.attempts + 1;
    const left = MAX_ATTEMPTS - attempts;
    await updateAuth(userId, { emailOtp: left > 0 ? { ...current, attempts } : null });
    throw new OtpError(left > 0 ? `That code is incorrect. ${left} attempt${left === 1 ? "" : "s"} left.` : "Too many incorrect attempts. Request a new code.", left > 0 ? 400 : 429);
  }
  await updateAuth(userId, { emailOtp: null });
}
