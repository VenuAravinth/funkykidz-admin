import { NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/schema";
import { authenticate, devLogin, isMfaEnabled } from "@/lib/userStore";
import { ErpApiError, ErpNotConfiguredError } from "@/lib/erpApi";
import { setMfaPending, startSession } from "@/lib/session";

export async function handleLogin(body: unknown) {
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { email, password, remember } = parsed.data;

  const devUser = devLogin(email, password);
  if (devUser === null) return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  if (devUser) {
    await startSession(devUser, remember, 0);
    return NextResponse.json({ user: devUser }, { status: 200 });
  }

  try {
    const { user, auth } = await authenticate(email, password);
    await setMfaPending({ userId: user.id, remember, emailVerified: false });
    return NextResponse.json({ mfa: isMfaEnabled(auth) ? "verify" : "setup", email: user.email }, { status: 200 });
  } catch (err) {
    if (err instanceof ErpNotConfiguredError) return NextResponse.json({ message: err.message }, { status: 503 });
    // Wrong credentials (401), deactivated account (403) or temporary lockout (429).
    if (err instanceof ErpApiError) return NextResponse.json({ message: err.message }, { status: err.status });
    console.error("Login failed", err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
