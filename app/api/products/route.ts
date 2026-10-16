import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { handleUploadImage } from "./handlers/uploadImage";
import { handleSignImageUrls } from "./handlers/signImageUrls";
import { analyzeImage } from "./handlers/ai";
import {
  adjustStock,
  createProduct,
  getProduct,
  listProducts,
  productErrorResponse,
  regenerateBarcodes,
  removeProduct,
  setPublished,
  updateProduct,
} from "./handlers/catalog";

const unauthenticated = () => NextResponse.json({ message: "Not authenticated." }, { status: 401 });

export async function GET(request: Request) {
  if (!(await getSessionUser())) return unauthenticated();
  const params = new URL(request.url).searchParams;
  try {
    switch (params.get("action")) {
      case "list":
        return await listProducts();
      case "get":
        return await getProduct(params.get("id"));
      default:
        return NextResponse.json({ message: "Unknown action." }, { status: 400 });
    }
  } catch (err) {
    return productErrorResponse(err, "Couldn't load products.");
  }
}

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    if (form?.get("action") === "uploadImage") return handleUploadImage(form);
    return NextResponse.json({ message: "Unknown action." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const action = (body as { action?: string } | null)?.action;
  if (action === "signImageUrls") return handleSignImageUrls(body);

  const user = await getSessionUser();
  if (!user) return unauthenticated();
  try {
    switch (action) {
      case "create":
        return await createProduct(body, user.email);
      case "update":
        return await updateProduct(body, user.email);
      case "remove":
        return await removeProduct(body, user.email);
      case "setPublished":
        return await setPublished(body, user.email);
      case "adjustStock":
        return await adjustStock(body, user.email);
      case "regenerateBarcodes":
        return await regenerateBarcodes(body, user.email);
      case "aiAnalyzeImage":
        return await analyzeImage(body, user.email);
      default:
        return NextResponse.json({ message: "Unknown action." }, { status: 400 });
    }
  } catch (err) {
    const failed = action === "aiAnalyzeImage" ? "The AI request failed. Please try again." : "Couldn't save the product. Please try again.";
    return productErrorResponse(err, failed);
  }
}
