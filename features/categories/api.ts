import { createAsyncThunk } from "@reduxjs/toolkit";
import { callApi, callApiGet } from "@/services/apiCaller";
import { CATEGORY_ENDPOINTS } from "@/services/endpoints";
import type { Category } from "@/types/product";
import type { CategoryInput } from "./schema";

interface CatalogStateSlice {
  catalog: { categoriesStatus: string };
}

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string; state: CatalogStateSlice }>(
  "catalog/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { items } = await callApiGet<{ items: Category[] }>(
        CATEGORY_ENDPOINTS.folder,
        CATEGORY_ENDPOINTS.actions.list,
        undefined,
        "Couldn't load categories.",
      );
      return items;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't load categories."));
    }
  },
  { condition: (_, { getState }) => getState().catalog.categoriesStatus !== "loading" },
);

export const createCategory = createAsyncThunk<Category, CategoryInput, { rejectValue: string }>(
  "catalog/createCategory",
  async (input, { rejectWithValue }) => {
    try {
      const { item } = await callApi<{ item: Category }>(
        CATEGORY_ENDPOINTS.folder,
        CATEGORY_ENDPOINTS.actions.create,
        { input },
        "Couldn't create the category.",
      );
      return item;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't create the category."));
    }
  },
);

export const updateCategory = createAsyncThunk<Category, { id: string; input: CategoryInput }, { rejectValue: string }>(
  "catalog/updateCategory",
  async (payload, { rejectWithValue }) => {
    try {
      const { item } = await callApi<{ item: Category }>(
        CATEGORY_ENDPOINTS.folder,
        CATEGORY_ENDPOINTS.actions.update,
        payload,
        "Couldn't update the category.",
      );
      return item;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't update the category."));
    }
  },
);

export const deleteCategory = createAsyncThunk<string, string, { rejectValue: string }>(
  "catalog/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await callApi(CATEGORY_ENDPOINTS.folder, CATEGORY_ENDPOINTS.actions.remove, { id }, "Couldn't delete the category.");
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't delete the category."));
    }
  },
);
