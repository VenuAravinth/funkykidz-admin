import { NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/schema";
import { findUserByEmail, verifyPassword, isMfaEnabled } from "@/lib/mockUserStore";
import { setMfaPending } from "@/lib/session";

export async function handleLogin(body: unknown) {
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { email, password, remember } = parsed.data;
  const user = findUserByEmail(email);

  if (!user || !verifyPassword(user, password)) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  await setMfaPending({ userId: user.id, remember, emailVerified: false });

  return NextResponse.json({ mfa: isMfaEnabled(user) ? "verify" : "setup", email: user.email }, { status: 200 });
}
