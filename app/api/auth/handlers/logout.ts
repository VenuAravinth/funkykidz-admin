import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/session";

export async function handleLogout() {
  await clearAuthCookies();
  return NextResponse.json({ ok: true }, { status: 200 });
}
