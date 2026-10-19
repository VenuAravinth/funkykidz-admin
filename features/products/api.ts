import { createAsyncThunk } from "@reduxjs/toolkit";
import { callApi, callApiGet } from "@/services/apiCaller";
import { http, getErrorMessage } from "@/services/http";
import { PRODUCT_ENDPOINTS } from "@/services/endpoints";
import type { Product } from "@/types/product";
import type { ProductWrite, StockAdjustmentWrite } from "./schema";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `${file.name}: only JPG, PNG or WebP images are allowed.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: images must be 10 MB or smaller.`;
  return null;
}

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("action", PRODUCT_ENDPOINTS.actions.uploadImage);
  form.append("file", file, file.name);
  try {
    const { data } = await http.post<{ imageUrl: string }>(`/${PRODUCT_ENDPOINTS.folder}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return data.imageUrl;
  } catch (err) {
    throw new Error(`${file.name}: ${getErrorMessage(err, "upload failed.")}`);
  }
}

export function fetchSignedImageUrls(urls: string[]) {
  return callApi<{ signedUrls: Record<string, string>; expiresAt: number }>(
    PRODUCT_ENDPOINTS.folder,
    PRODUCT_ENDPOINTS.actions.signImageUrls,
    { urls },
    "Couldn't load product images.",
  );
}

const { folder, actions } = PRODUCT_ENDPOINTS;
const errorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

interface CatalogStateSlice {
  catalog: { productsStatus: string };
}

function productThunk<TArg>(type: string, action: string, fallback: string, toPayload: (arg: TArg) => object) {
  return createAsyncThunk<Product, TArg, { rejectValue: string }>(`catalog/${type}`, async (arg, { rejectWithValue }) => {
    try {
      return (await callApi<{ item: Product }>(folder, action, toPayload(arg), fallback)).item;
    } catch (err) {
      return rejectWithValue(errorMessage(err, fallback));
    }
  });
}

export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: string; state: CatalogStateSlice }>(
  "catalog/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      return (await callApiGet<{ items: Product[] }>(folder, actions.list, undefined, "Couldn't load products.")).items;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't load products."));
    }
  },
  { condition: (_, { getState }) => getState().catalog.productsStatus !== "loading" },
);

export const fetchProduct = createAsyncThunk<Product, string, { rejectValue: string }>(
  "catalog/fetchProduct",
  async (id, { rejectWithValue }) => {
    try {
      return (await callApiGet<{ item: Product }>(folder, actions.get, { id }, "Couldn't load the product.")).item;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't load the product."));
    }
  },
);

export const createProduct = productThunk<ProductWrite>("createProduct", actions.create, "Couldn't create the product.", (input) => ({ input }));

export const updateProduct = productThunk<{ id: string; input: ProductWrite }>(
  "updateProduct",
  actions.update,
  "Couldn't save the product.",
  (arg) => arg,
);

export const setProductPublished = productThunk<{ id: string; published: boolean }>(
  "setProductPublished",
  actions.setPublished,
  "Couldn't change the publish status.",
  (arg) => arg,
);

export const adjustProductStock = productThunk<{ id: string; input: StockAdjustmentWrite }>(
  "adjustProductStock",
  actions.adjustStock,
  "Couldn't update stock.",
  (arg) => arg,
);

export const regenerateProductBarcodes = productThunk<{ id: string; variantId?: string }>(
  "regenerateProductBarcodes",
  actions.regenerateBarcodes,
  "Couldn't regenerate barcodes.",
  (arg) => arg,
);

export const deleteProduct = createAsyncThunk<string, string, { rejectValue: string }>(
  "catalog/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await callApi(folder, actions.remove, { id }, "Couldn't delete the product.");
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't delete the product."));
    }
  },
);

// --- AI helpers (Gemini via the ERP backend) -----------------------------------------------------

/** Details Gemini could see in the photo; empty strings when something wasn't clearly visible. */
export interface AiVisibleAttributes {
  garmentType: string;
  colours: string[];
  colourHex: string | null;
  pattern: string;
  sleeves: string;
  neckline: string;
  style: string;
}

export interface AiProductAnalysis {
  model: string;
  title: string;
  shortDescription: string;
  categorySuggestion: { id: string; name: string } | null;
  visibleAttributes: AiVisibleAttributes;
  /** True when the backend returned this photo's earlier draft instead of calling Gemini again. */
  cached: boolean;
}

// Gemini can take up to a minute, far beyond the default request timeout.
async function aiPost<T>(action: string, payload: object, timeout: number, fallback: string): Promise<T> {
  try {
    const { data } = await http.post<T>(`/${PRODUCT_ENDPOINTS.folder}`, { action, ...payload }, { timeout });
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, fallback));
  }
}

// `regenerate` asks Gemini again; otherwise the backend may return the photo's earlier draft.
export function analyzeProductImage(imageUrl: string, { hints, regenerate = false }: { hints?: Record<string, string>; regenerate?: boolean } = {}) {
  return aiPost<AiProductAnalysis>(PRODUCT_ENDPOINTS.actions.aiAnalyzeImage, { imageUrl, hints, regenerate }, 90_000, "Couldn't analyse the photo. Please try again.");
}
