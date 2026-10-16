import { createAsyncThunk } from "@reduxjs/toolkit";
import { callApi, callApiGet } from "@/services/apiCaller";
import { BRAND_ENDPOINTS } from "@/services/endpoints";
import type { Brand } from "@/types/product";
import type { BrandInput } from "./schema";

interface CatalogStateSlice {
  catalog: { brandsStatus: string };
}

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

export const fetchBrands = createAsyncThunk<Brand[], void, { rejectValue: string; state: CatalogStateSlice }>(
  "catalog/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const { items } = await callApiGet<{ items: Brand[] }>(
        BRAND_ENDPOINTS.folder,
        BRAND_ENDPOINTS.actions.list,
        undefined,
        "Couldn't load brands.",
      );
      return items;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't load brands."));
    }
  },
  { condition: (_, { getState }) => getState().catalog.brandsStatus !== "loading" },
);

export const createBrand = createAsyncThunk<Brand, BrandInput, { rejectValue: string }>(
  "catalog/createBrand",
  async (input, { rejectWithValue }) => {
    try {
      const { item } = await callApi<{ item: Brand }>(
        BRAND_ENDPOINTS.folder,
        BRAND_ENDPOINTS.actions.create,
        { input },
        "Couldn't create the brand.",
      );
      return item;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't create the brand."));
    }
  },
);

export const updateBrand = createAsyncThunk<Brand, { id: string; input: BrandInput }, { rejectValue: string }>(
  "catalog/updateBrand",
  async (payload, { rejectWithValue }) => {
    try {
      const { item } = await callApi<{ item: Brand }>(
        BRAND_ENDPOINTS.folder,
        BRAND_ENDPOINTS.actions.update,
        payload,
        "Couldn't update the brand.",
      );
      return item;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't update the brand."));
    }
  },
);

export const deleteBrand = createAsyncThunk<string, string, { rejectValue: string }>(
  "catalog/deleteBrand",
  async (id, { rejectWithValue }) => {
    try {
      await callApi(BRAND_ENDPOINTS.folder, BRAND_ENDPOINTS.actions.remove, { id }, "Couldn't delete the brand.");
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't delete the brand."));
    }
  },
);
