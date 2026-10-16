import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/features/auth/schema";
import { findUserByEmail } from "@/lib/mockUserStore";

const GENERIC_MESSAGE = "If an account exists for that email, a reset link has been sent.";

export async function handleForgotPassword(body: unknown) {
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  findUserByEmail(parsed.data.email);

  return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
}
