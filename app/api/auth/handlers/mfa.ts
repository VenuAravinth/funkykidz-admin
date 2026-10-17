import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { mfaCodeSchema, mfaEmailSchema } from "@/features/auth/schema";
import { getAuth, isMfaEnabled, toPublicUser, updateAuth, type UserWithAuth } from "@/lib/userStore";
import { getMfaPending, setMfaPending, startSession, type MfaPendingPayload } from "@/lib/session";
import { sendEmailOtp, verifyEmailOtp, OtpError, type OtpPurpose } from "@/lib/emailOtp";
import { MailDeliveryError, MailNotConfiguredError } from "@/lib/mailer";
import { ErpApiError, ErpNotConfiguredError } from "@/lib/erpApi";
import { generateTotpSecret, totpUri, verifyTotp } from "@/lib/totp";

const MAX_TOTP_FAILURES = 5;
const TOTP_LOCK_MS = 10 * 60 * 1000;

type Context = UserWithAuth & { pending: MfaPendingPayload };

function error(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

async function withPending(
  stage: "setup" | "verify",
  handler: (ctx: Context) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const pending = await getMfaPending();
    const found = pending && (await getAuth(pending.userId));
    if (!pending || !found) return error("Your sign-in session has expired. Please sign in again.", 401);
    if (found.user.status !== "active") return error("This account has been deactivated. Contact your administrator.", 403);
    if ((stage === "setup") === isMfaEnabled(found.auth)) {
      return error(stage === "setup" ? "Two-factor authentication is already set up." : "Two-factor authentication isn't set up yet.", 409);
    }
    return await handler({ ...found, pending });
  } catch (err) {
    if (err instanceof OtpError) return error(err.message, err.status);
    if (err instanceof MailNotConfiguredError || err instanceof ErpNotConfiguredError) return error(err.message, 503);
    if (err instanceof MailDeliveryError) return error(err.message, 502);
    if (err instanceof ErpApiError) return error(err.message, err.status >= 500 ? err.status : 502);
    console.error("MFA request failed", err);
    return error("Something went wrong. Please try again.", 500);
  }
}

function parseCode(body: unknown) {
  const parsed = mfaCodeSchema.safeParse(body);
  return parsed.success ? parsed.data.code : null;
}

/** Checks an authenticator code, with a per-account limit on wrong guesses. Returns the matched step. */
async function checkTotp({ user, auth }: UserWithAuth, secret: string, code: string): Promise<number | NextResponse> {
  const failures = auth.mfa.failures && auth.mfa.failures.resetAt > Date.now() ? auth.mfa.failures : null;
  if ((failures?.count ?? 0) >= MAX_TOTP_FAILURES) {
    return error("Too many incorrect codes. Try again in a few minutes or use the email code instead.", 429);
  }

  const step = verifyTotp(secret, code, auth.mfa.lastStep ?? 0);
  if (step === null) {
    const current = failures ?? { count: 0, resetAt: Date.now() + TOTP_LOCK_MS };
    await updateAuth(user.id, { mfa: { failures: { ...current, count: current.count + 1 } } });
    return error("That code is incorrect or has expired.");
  }
  return step;
}

async function signIn({ pending, user, auth }: Context, mfa?: UserWithAuth["auth"]["mfa"]) {
  await updateAuth(user.id, { recordLogin: true, ...(mfa && { mfa }) });
  const publicUser = toPublicUser(user);
  await startSession(publicUser, pending.remember, auth.sessionVersion);
  return NextResponse.json({ user: publicUser }, { status: 200 });
}

async function sendOtp({ user, auth }: Context, purpose: OtpPurpose) {
  await sendEmailOtp(user, auth.emailOtp, purpose);
  return NextResponse.json({ message: `We've sent a 6-digit code to ${user.email}.` }, { status: 200 });
}

export function handleMfaSetupSendOtp(body: unknown) {
  return withPending("setup", async (ctx) => {
    const parsed = mfaEmailSchema.safeParse(body);
    if (!parsed.success) return error("Enter a valid email address.");
    if (parsed.data.email !== ctx.user.email) return error("That email doesn't match the account you signed in with.");
    return sendOtp(ctx, "mfa-setup");
  });
}

export function handleMfaSetupVerifyOtp(body: unknown) {
  return withPending("setup", async ({ pending, user, auth }) => {
    const code = parseCode(body);
    if (!code) return error("Enter the 6-digit code.");
    await verifyEmailOtp(user.id, auth.emailOtp, "mfa-setup", code);
    await setMfaPending({ userId: user.id, remember: pending.remember, emailVerified: true });
    return NextResponse.json({ ok: true }, { status: 200 });
  });
}

export function handleMfaSetupInit() {
  return withPending("setup", async ({ pending, user, auth }) => {
    if (!pending.emailVerified) return error("Verify your email address first.", 403);
    let secret = auth.mfa.pendingSecret;
    if (!secret) {
      secret = generateTotpSecret();
      await updateAuth(user.id, { mfa: { pendingSecret: secret } });
    }
    const qrCode = await QRCode.toDataURL(totpUri(secret, user.email), { margin: 1, width: 240 });
    return NextResponse.json({ qrCode, secret }, { status: 200 });
  });
}

export function handleMfaSetupConfirm(body: unknown) {
  return withPending("setup", async (ctx) => {
    const secret = ctx.auth.mfa.pendingSecret;
    if (!ctx.pending.emailVerified || !secret) return error("Start the authenticator setup first.", 403);
    const code = parseCode(body);
    if (!code) return error("Enter the 6-digit code.");
    const step = await checkTotp(ctx, secret, code);
    if (step instanceof NextResponse) return step;
    return signIn(ctx, { secret, pendingSecret: null, lastStep: step, failures: null });
  });
}

export function handleMfaVerify(body: unknown) {
  return withPending("verify", async (ctx) => {
    const code = parseCode(body);
    if (!code) return error("Enter the 6-digit code.");
    const step = await checkTotp(ctx, ctx.auth.mfa.secret!, code);
    if (step instanceof NextResponse) return step;
    return signIn(ctx, { lastStep: step, failures: null });
  });
}

export function handleMfaLoginSendOtp() {
  return withPending("verify", async (ctx) => sendOtp(ctx, "mfa-login"));
}

export function handleMfaLoginVerifyOtp(body: unknown) {
  return withPending("verify", async (ctx) => {
    const code = parseCode(body);
    if (!code) return error("Enter the 6-digit code.");
    await verifyEmailOtp(ctx.user.id, ctx.auth.emailOtp, "mfa-login", code);
    return signIn(ctx);
  });
}
