import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function handleMe() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  return NextResponse.json({ user }, { status: 200 });
}
