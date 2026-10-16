import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "@/features/categories/api";
import { createBrand, deleteBrand, fetchBrands, updateBrand } from "@/features/brands/api";
import {
  adjustProductStock,
  createProduct,
  deleteProduct,
  fetchProduct,
  fetchProducts,
  regenerateProductBarcodes,
  setProductPublished,
  updateProduct,
} from "@/features/products/api";
import type { AsyncStatus } from "./authSlice";
import type { Brand, Category, Product, ProductVariant } from "@/types/product";

export interface CatalogState {
  categories: Category[];
  brands: Brand[];
  categoriesStatus: AsyncStatus;
  categoriesError: string | null;
  brandsStatus: AsyncStatus;
  brandsError: string | null;
  products: Product[];
  productsStatus: AsyncStatus;
  productsError: string | null;
}

const initialState: CatalogState = {
  categories: [],
  brands: [],
  categoriesStatus: "idle",
  categoriesError: null,
  brandsStatus: "idle",
  brandsError: null,
  products: [],
  productsStatus: "idle",
  productsError: null,
};

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

function upsert<T extends { id: string; name: string }>(list: T[], item: T): T[] {
  return [...list.filter((existing) => existing.id !== item.id), item].sort(byName);
}

function upsertProduct(state: CatalogState, product: Product) {
  const index = state.products.findIndex((p) => p.id === product.id);
  if (index === -1) state.products.unshift(product);
  else state.products[index] = product;
}

type VariantChange = { productId: string; variantId?: string; quantity: number };

function withVariant(state: CatalogState, { productId, variantId }: VariantChange, change: (v: ProductVariant) => void) {
  const product = state.products.find((p) => p.id === productId);
  const variant = product?.variants.find((v) => v.id === variantId) ?? product?.variants[0];
  if (!product || !variant) return;
  change(variant);
  product.stock = product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
  product.inStock = product.variants.some((v) => v.stock === null || v.stock > 0);
}

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    reserveStock: (state, action: PayloadAction<VariantChange>) => {
      withVariant(state, action.payload, (v) => {
        v.reservedStock = (v.reservedStock ?? 0) + action.payload.quantity;
      });
    },
    releaseReservedStock: (state, action: PayloadAction<VariantChange>) => {
      withVariant(state, action.payload, (v) => {
        v.reservedStock = Math.max(0, (v.reservedStock ?? 0) - action.payload.quantity);
      });
    },
    fulfillReservedStock: (state, action: PayloadAction<VariantChange>) => {
      withVariant(state, action.payload, (v) => {
        if (v.stock !== null) v.stock = Math.max(0, v.stock - action.payload.quantity);
        v.reservedStock = Math.max(0, (v.reservedStock ?? 0) - action.payload.quantity);
      });
    },
    restockFromReturn: (state, action: PayloadAction<VariantChange>) => {
      withVariant(state, action.payload, (v) => {
        if (v.stock !== null) v.stock += action.payload.quantity;
      });
    },
    markReturnedDamaged: (state, action: PayloadAction<VariantChange>) => {
      withVariant(state, action.payload, (v) => {
        v.damagedStock = (v.damagedStock ?? 0) + action.payload.quantity;
      });
    },
    adjustVariantStock: (state, action: PayloadAction<{ productId: string; variantId: string; stock: number }>) => {
      withVariant(state, { ...action.payload, quantity: 0 }, (v) => {
        v.stock = action.payload.stock;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.productsStatus = "loading";
        state.productsError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.productsStatus = "succeeded";
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.productsStatus = "failed";
        state.productsError = action.payload ?? "Couldn't load products.";
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = "loading";
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesStatus = "failed";
        state.categoriesError = action.payload ?? "Couldn't load categories.";
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories = upsert(state.categories, action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.categories = upsert(state.categories, action.payload);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload);
      })

      .addCase(fetchBrands.pending, (state) => {
        state.brandsStatus = "loading";
        state.brandsError = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brandsStatus = "succeeded";
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.brandsStatus = "failed";
        state.brandsError = action.payload ?? "Couldn't load brands.";
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.brands = upsert(state.brands, action.payload);
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.brands = upsert(state.brands, action.payload);
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter((b) => b.id !== action.payload);
      });
    for (const thunk of [fetchProduct, createProduct, updateProduct, setProductPublished, adjustProductStock, regenerateProductBarcodes]) {
      builder.addCase(thunk.fulfilled, (state, action) => upsertProduct(state, action.payload));
    }
  },
});

export const {
  reserveStock,
  releaseReservedStock,
  fulfillReservedStock,
  restockFromReturn,
  markReturnedDamaged,
  adjustVariantStock,
} = catalogSlice.actions;

interface RootStateWithCatalog {
  catalog: CatalogState;
}

export const selectCategories = (state: RootStateWithCatalog) => state.catalog.categories;
export const selectBrands = (state: RootStateWithCatalog) => state.catalog.brands;
export const selectCategoriesStatus = (state: RootStateWithCatalog) => state.catalog.categoriesStatus;
export const selectCategoriesError = (state: RootStateWithCatalog) => state.catalog.categoriesError;
export const selectBrandsStatus = (state: RootStateWithCatalog) => state.catalog.brandsStatus;
export const selectBrandsError = (state: RootStateWithCatalog) => state.catalog.brandsError;
export const selectProducts = (state: RootStateWithCatalog) => state.catalog.products;
export const selectProductsStatus = (state: RootStateWithCatalog) => state.catalog.productsStatus;
export const selectProductsError = (state: RootStateWithCatalog) => state.catalog.productsError;
export const selectVariants = createSelector([selectProducts], (products) => products.flatMap((p) => p.variants));

export const selectCategoryById = (state: RootStateWithCatalog, id: string) =>
  state.catalog.categories.find((c) => c.id === id);
export const selectBrandById = (state: RootStateWithCatalog, id: string) =>
  state.catalog.brands.find((b) => b.id === id);
export const selectProductById = (state: RootStateWithCatalog, id: string) =>
  state.catalog.products.find((p) => p.id === id);

export default catalogSlice.reducer;
