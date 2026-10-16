import { NextResponse } from "next/server";
import { z } from "zod";
import { productWriteSchema, stockAdjustmentWriteSchema } from "@/features/products/schema";
import { ErpApiError, ErpNotConfiguredError, erpRequest } from "@/lib/erpApi";
import type { Product, ProductGender, ProductTag } from "@/types/product";

interface ErpVariant {
  id: string;
  color: string;
  size: string;
  barcode: string;
  stock: number | null;
}

interface ErpProduct {
  id: string;
  slug: string;
  name: string;
  sku?: string | null;
  categoryId?: string;
  category?: string;
  brandId?: string | null;
  brand?: string | null;
  subcategory?: string;
  gender: ProductGender;
  tag?: ProductTag | null;
  price: number;
  oldPrice?: number | null;
  costPrice?: number;
  reorderLevel?: number;
  shortDescription?: string;
  description?: string;
  fabric?: string;
  fit?: string;
  care?: string;
  images?: string[];
  attributes?: Product["attributes"];
  colorways?: { name: string; swatchHex: string }[];
  variants?: ErpVariant[];
  totalStock: number;
  inStock: boolean;
  lowStock: boolean;
  published?: boolean;
  createdAt?: string;
  dateAdded?: string;
}

const PAGE_SIZE = 100;
const objectId = z.string().regex(/^[a-f0-9]{24}$/);
const idSchema = z.object({ id: objectId });

function toProduct(p: ErpProduct, detailsLoaded = false): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku || undefined,
    categoryId: p.categoryId ?? "",
    category: p.category,
    brandId: p.brandId ?? undefined,
    brand: p.brand ?? undefined,
    subcategory: p.subcategory || undefined,
    gender: p.gender,
    tag: p.tag ?? undefined,
    price: p.price,
    originalPrice: p.oldPrice ?? undefined,
    costPrice: p.costPrice ?? 0,
    reorderLevel: p.reorderLevel ?? 0,
    shortDescription: p.shortDescription || undefined,
    description: p.description || undefined,
    fabric: p.fabric || undefined,
    fit: p.fit || undefined,
    care: p.care || undefined,
    images: p.images ?? [],
    attributes: p.attributes ?? undefined,
    colors: (p.colorways ?? []).map((c) => ({ name: c.name, hex: c.swatchHex })),
    variants: (p.variants ?? []).map((v) => ({ ...v, productId: p.id })),
    stock: p.totalStock,
    inStock: p.inStock,
    lowStock: p.lowStock,
    published: Boolean(p.published),
    createdDate: (p.createdAt ?? p.dateAdded ?? "").slice(0, 10),
    detailsLoaded,
  };
}

export function productErrorResponse(err: unknown, fallback: string) {
  if (err instanceof ErpNotConfiguredError) return NextResponse.json({ message: err.message }, { status: 503 });
  if (err instanceof ErpApiError) return NextResponse.json({ message: err.message, details: err.details }, { status: err.status });
  console.error(err);
  return NextResponse.json({ message: fallback }, { status: 500 });
}

const invalid = () => NextResponse.json({ message: "Invalid input." }, { status: 400 });

export async function listProducts() {
  const items: Product[] = [];
  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const res = await erpRequest<{ items: ErpProduct[]; totalPages: number }>("/products", {
      query: { page, limit: PAGE_SIZE, sort: "newest" },
    });
    items.push(...res.items.map((p) => toProduct(p)));
    totalPages = res.totalPages;
  }
  return NextResponse.json({ items }, { status: 200 });
}

export async function getProduct(id: string | null) {
  const parsed = objectId.safeParse(id);
  if (!parsed.success) return invalid();
  const res = await erpRequest<{ product: ErpProduct }>(`/products/${parsed.data}`);
  return NextResponse.json({ item: toProduct(res.product, true) }, { status: 200 });
}

export async function createProduct(body: unknown, actor: string) {
  const parsed = z.object({ input: productWriteSchema }).safeParse(body);
  if (!parsed.success) return invalid();
  const res = await erpRequest<{ product: ErpProduct }>("/products", { method: "POST", body: parsed.data.input, actor });
  return NextResponse.json({ item: toProduct(res.product, true) }, { status: 201 });
}

export async function updateProduct(body: unknown, actor: string) {
  const parsed = idSchema.extend({ input: productWriteSchema }).safeParse(body);
  if (!parsed.success) return invalid();
  const res = await erpRequest<{ product: ErpProduct }>(`/products/${parsed.data.id}`, {
    method: "PATCH",
    body: parsed.data.input,
    actor,
  });
  return NextResponse.json({ item: toProduct(res.product, true) }, { status: 200 });
}

export async function removeProduct(body: unknown, actor: string) {
  const parsed = idSchema.safeParse(body);
  if (!parsed.success) return invalid();
  await erpRequest(`/products/${parsed.data.id}`, { method: "DELETE", actor });
  return NextResponse.json({ id: parsed.data.id }, { status: 200 });
}

export async function setPublished(body: unknown, actor: string) {
  const parsed = idSchema.extend({ published: z.boolean() }).safeParse(body);
  if (!parsed.success) return invalid();
  const { id, published } = parsed.data;
  const res = await erpRequest<{ product: ErpProduct }>(`/products/${id}/${published ? "publish" : "unpublish"}`, {
    method: "POST",
    actor,
  });
  return NextResponse.json({ item: toProduct(res.product, true) }, { status: 200 });
}

export async function adjustStock(body: unknown, actor: string) {
  const parsed = idSchema.extend({ input: stockAdjustmentWriteSchema }).safeParse(body);
  if (!parsed.success) return invalid();
  await erpRequest(`/products/${parsed.data.id}/stock/adjust`, { method: "POST", body: parsed.data.input, actor });
  const res = await erpRequest<{ product: ErpProduct }>(`/products/${parsed.data.id}`, { actor });
  return NextResponse.json({ item: toProduct(res.product, true) }, { status: 200 });
}

export async function regenerateBarcodes(body: unknown, actor: string) {
  const parsed = idSchema.extend({ variantId: objectId.optional() }).safeParse(body);
  if (!parsed.success) return invalid();
  const { id, variantId } = parsed.data;
  const res = await erpRequest<{ product: ErpProduct }>(`/products/${id}/barcodes/regenerate`, {
    method: "POST",
    body: variantId ? { scope: "variant", variantId } : { scope: "all" },
    actor,
  });
  return NextResponse.json({ item: toProduct(res.product, true) }, { status: 200 });
}
