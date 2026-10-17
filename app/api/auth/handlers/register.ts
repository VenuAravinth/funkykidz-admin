import { NextResponse } from "next/server";

// ERP accounts are created by an administrator in User Management, never by self sign-up.
export async function handleRegister() {
  return NextResponse.json(
    { message: "Accounts are created by an administrator. Ask them to add you in User Management." },
    { status: 403 },
  );
}
