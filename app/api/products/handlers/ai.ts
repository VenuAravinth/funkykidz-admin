import { NextResponse } from "next/server";
import { analyzeImageSchema } from "@/features/products/schema";
import { erpRequest } from "@/lib/erpApi";

// AI product details for the product form. The ERP backend holds the Gemini key and does the work;
// this route only checks the session and forwards the request.

const invalid = () => NextResponse.json({ message: "Invalid input." }, { status: 400 });

export async function analyzeImage(body: unknown, actor: string) {
  const parsed = analyzeImageSchema.safeParse(body);
  if (!parsed.success) return invalid();
  const data = await erpRequest("/ai/product-details", { method: "POST", body: parsed.data, actor });
  return NextResponse.json(data, { status: 200 });
}
