import { NextResponse } from "next/server";
import { signImageUrlsSchema } from "@/features/products/schema";
import { ErpApiError, ErpNotConfiguredError, erpRequest } from "@/lib/erpApi";
import { getSessionUser } from "@/lib/session";

export async function handleSignImageUrls(body: unknown) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const parsed = signImageUrlsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input." }, { status: 400 });
  }

  try {
    const signed = await erpRequest<{ signedUrls: Record<string, string>; expiresAt: number }>("/images/sign", {
      method: "POST",
      body: parsed.data,
    });
    return NextResponse.json(signed, { status: 200 });
  } catch (err) {
    if (err instanceof ErpNotConfiguredError) return NextResponse.json({ message: err.message }, { status: 503 });
    if (err instanceof ErpApiError) return NextResponse.json({ message: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ message: "Couldn't load product images." }, { status: 502 });
  }
}
