import { NextResponse } from "next/server";
import { registerSchema } from "@/features/auth/schema";
import { findUserByEmail, createUser, toPublicUser } from "@/lib/mockUserStore";

export async function handleRegister(body: unknown) {
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  if (findUserByEmail(email)) {
    return NextResponse.json({ message: "An account with that email already exists." }, { status: 409 });
  }

  const user = createUser({ name, email, password });

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}
