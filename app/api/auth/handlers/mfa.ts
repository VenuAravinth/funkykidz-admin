import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { mfaCodeSchema, mfaEmailSchema } from "@/features/auth/schema";
import { findUserById, isMfaEnabled, toPublicUser } from "@/lib/mockUserStore";
import { getMfaPending, setMfaPending, startSession, type MfaPendingPayload } from "@/lib/session";
import { sendEmailOtp, verifyEmailOtp, OtpError, type OtpPurpose } from "@/lib/emailOtp";
import { MailNotConfiguredError } from "@/lib/mailer";
import { generateTotpSecret, totpUri, verifyTotp } from "@/lib/totp";

const MAX_TOTP_FAILURES = 5;
const TOTP_LOCK_MS = 10 * 60 * 1000;

const globalForMfa = globalThis as typeof globalThis & {
  __fkTotpFailures?: Map<string, { count: number; resetAt: number }>;
};
const totpFailures = (globalForMfa.__fkTotpFailures ??= new Map());

type PendingUser = NonNullable<ReturnType<typeof findUserById>>;
type Context = { pending: MfaPendingPayload; user: PendingUser };

function error(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

async function withPending(
  stage: "setup" | "verify",
  handler: (ctx: Context) => Promise<NextResponse>,
): Promise<NextResponse> {
  const pending = await getMfaPending();
  const user = pending && findUserById(pending.userId);
  if (!pending || !user) return error("Your sign-in session has expired. Please sign in again.", 401);
  if ((stage === "setup") === isMfaEnabled(user)) {
    return error(stage === "setup" ? "Two-factor authentication is already set up." : "Two-factor authentication isn't set up yet.", 409);
  }
  try {
    return await handler({ pending, user });
  } catch (err) {
    if (err instanceof OtpError) return error(err.message, err.status);
    if (err instanceof MailNotConfiguredError) return error(err.message, 503);
    console.error("MFA request failed", err);
    return error("Something went wrong. Please try again.", 500);
  }
}

function parseCode(body: unknown) {
  const parsed = mfaCodeSchema.safeParse(body);
  return parsed.success ? parsed.data.code : null;
}

function checkTotp(user: PendingUser, secret: string, code: string): NextResponse | null {
  const failures = totpFailures.get(user.id);
  if (failures && failures.resetAt < Date.now()) totpFailures.delete(user.id);
  if ((totpFailures.get(user.id)?.count ?? 0) >= MAX_TOTP_FAILURES) {
    return error("Too many incorrect codes. Try again in a few minutes or use the email code instead.", 429);
  }

  const step = verifyTotp(secret, code, user.lastTotpStep);
  if (step === null) {
    const current = totpFailures.get(user.id) ?? { count: 0, resetAt: Date.now() + TOTP_LOCK_MS };
    totpFailures.set(user.id, { ...current, count: current.count + 1 });
    return error("That code is incorrect or has expired.");
  }
  user.lastTotpStep = step;
  totpFailures.delete(user.id);
  return null;
}

async function signIn({ pending, user }: Context) {
  const publicUser = toPublicUser(user);
  await startSession(publicUser, pending.remember);
  return NextResponse.json({ user: publicUser }, { status: 200 });
}

async function sendOtp(user: PendingUser, purpose: OtpPurpose) {
  await sendEmailOtp(user.id, user.email, purpose);
  return NextResponse.json({ message: `We've sent a 6-digit code to ${user.email}.` }, { status: 200 });
}

export function handleMfaSetupSendOtp(body: unknown) {
  return withPending("setup", async ({ user }) => {
    const parsed = mfaEmailSchema.safeParse(body);
    if (!parsed.success) return error("Enter a valid email address.");
    if (parsed.data.email !== user.email) return error("That email doesn't match the account you signed in with.");
    return sendOtp(user, "mfa-setup");
  });
}

export function handleMfaSetupVerifyOtp(body: unknown) {
  return withPending("setup", async ({ pending, user }) => {
    const code = parseCode(body);
    if (!code) return error("Enter the 6-digit code.");
    verifyEmailOtp(user.id, "mfa-setup", code);
    await setMfaPending({ userId: user.id, remember: pending.remember, emailVerified: true });
    return NextResponse.json({ ok: true }, { status: 200 });
  });
}

export function handleMfaSetupInit() {
  return withPending("setup", async ({ pending, user }) => {
    if (!pending.emailVerified) return error("Verify your email address first.", 403);
    user.mfaPendingSecret ??= generateTotpSecret();
    const qrCode = await QRCode.toDataURL(totpUri(user.mfaPendingSecret, user.email), { margin: 1, width: 240 });
    return NextResponse.json({ qrCode, secret: user.mfaPendingSecret }, { status: 200 });
  });
}

export function handleMfaSetupConfirm(body: unknown) {
  return withPending("setup", async (ctx) => {
    const { pending, user } = ctx;
    if (!pending.emailVerified || !user.mfaPendingSecret) return error("Start the authenticator setup first.", 403);
    const code = parseCode(body);
    if (!code) return error("Enter the 6-digit code.");
    const failed = checkTotp(user, user.mfaPendingSecret, code);
    if (failed) return failed;
    user.mfaSecret = user.mfaPendingSecret;
    user.mfaPendingSecret = null;
    return signIn(ctx);
  });
}

export function handleMfaVerify(body: unknown) {
  return withPending("verify", async (ctx) => {
    const code = parseCode(body);
    if (!code) return error("Enter the 6-digit code.");
    const failed = checkTotp(ctx.user, ctx.user.mfaSecret!, code);
    return failed ?? signIn(ctx);
  });
}

export function handleMfaLoginSendOtp() {
  return withPending("verify", async ({ user }) => sendOtp(user, "mfa-login"));
}

export function handleMfaLoginVerifyOtp(body: unknown) {
  return withPending("verify", async (ctx) => {
    const code = parseCode(body);
    if (!code) return error("Enter the 6-digit code.");
    verifyEmailOtp(ctx.user.id, "mfa-login", code);
    return signIn(ctx);
  });
}
