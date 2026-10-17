import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/features/auth/schema";

const GENERIC_MESSAGE = "Passwords are reset by your administrator. Ask them to set a new one for you in User Management.";

export async function handleForgotPassword(body: unknown) {
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
}
