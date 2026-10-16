import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ErpApiError, ErpNotConfiguredError, erpRequest } from "@/lib/erpApi";
import { getSessionUser } from "@/lib/session";
import type { Brand, Category } from "@/types/product";

type TaxonomyItem = Category | Brand;

interface ErpTaxonomy {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: TaxonomyItem["status"];
  productCount?: number;
}

interface ErpListResponse {
  items: ErpTaxonomy[];
  totalPages: number;
}

const PAGE_SIZE = 200;

const idSchema = z.object({ id: z.string().regex(/^[a-f0-9]{24}$/i) });

function toItem(doc: ErpTaxonomy): TaxonomyItem {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description || undefined,
    status: doc.status,
    productCount: doc.productCount ?? 0,
  };
}

function errorResponse(err: unknown, fallback: string) {
  if (err instanceof ErpNotConfiguredError) return NextResponse.json({ message: err.message }, { status: 503 });
  if (err instanceof ErpApiError) return NextResponse.json({ message: err.message, details: err.details }, { status: err.status });
  console.error(err);
  return NextResponse.json({ message: fallback }, { status: 500 });
}

interface TaxonomyInput {
  name: string;
  description?: string;
  status: TaxonomyItem["status"];
}

export function makeTaxonomyRoute(options: {
  resource: "categories" | "brands";
  key: "category" | "brand";
  label: string;
  inputSchema: z.ZodType<TaxonomyInput>;
}) {
  const { resource, key, label, inputSchema } = options;
  const writeSchema = z.object({ input: inputSchema });

  async function list() {
    const items: TaxonomyItem[] = [];
    for (let page = 1, totalPages = 1; page <= totalPages; page++) {
      const res = await erpRequest<ErpListResponse>(`/${resource}`, { query: { page, limit: PAGE_SIZE, sort: "name_asc" } });
      items.push(...res.items.map(toItem));
      totalPages = res.totalPages;
    }
    return NextResponse.json({ items }, { status: 200 });
  }

  async function create(body: unknown, actor: string) {
    const parsed = writeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "Invalid input." }, { status: 400 });
    const res = await erpRequest<Record<string, ErpTaxonomy>>(`/${resource}`, { method: "POST", body: parsed.data.input, actor });
    return NextResponse.json({ item: toItem(res[key]) }, { status: 201 });
  }

  async function update(body: unknown, actor: string) {
    const parsed = writeSchema.and(idSchema).safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "Invalid input." }, { status: 400 });
    const res = await erpRequest<Record<string, ErpTaxonomy>>(`/${resource}/${parsed.data.id}`, {
      method: "PATCH",
      body: { description: "", ...parsed.data.input },
      actor,
    });
    return NextResponse.json({ item: toItem(res[key]) }, { status: 200 });
  }

  async function remove(body: unknown, actor: string) {
    const parsed = idSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "Invalid input." }, { status: 400 });
    await erpRequest(`/${resource}/${parsed.data.id}`, { method: "DELETE", actor });
    return NextResponse.json({ id: parsed.data.id }, { status: 200 });
  }

  async function GET(request: Request) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });

    const action = new URL(request.url).searchParams.get("action");
    try {
      switch (action) {
        case "list":
          return await list();
        default:
          return NextResponse.json({ message: "Unknown action." }, { status: 400 });
      }
    } catch (err) {
      return errorResponse(err, `Couldn't load ${resource}.`);
    }
  }

  async function POST(request: Request) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });

    const body = await request.json().catch(() => null);
    const action = (body as { action?: string } | null)?.action;
    try {
      switch (action) {
        case "create":
          return await create(body, user.email);
        case "update":
          return await update(body, user.email);
        case "remove":
          return await remove(body, user.email);
        default:
          return NextResponse.json({ message: "Unknown action." }, { status: 400 });
      }
    } catch (err) {
      return errorResponse(err, `Couldn't save the ${label}. Please try again.`);
    }
  }

  return { GET, POST };
}
