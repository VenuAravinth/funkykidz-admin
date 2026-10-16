export type EntityStatus = "active" | "inactive";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: EntityStatus;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: EntityStatus;
  productCount?: number;
}

export const productGenders = ["Boys", "Girls", "Unisex"] as const;
export type ProductGender = (typeof productGenders)[number];

export const productSizeSuggestions = [
  "0-3M",
  "3-6M",
  "6-9M",
  "9-12M",
  "1-2Y",
  "2-3Y",
  "3-4Y",
  "4-5Y",
  "5-6Y",
  "6-7Y",
  "7-8Y",
  "8-10Y",
  "10-12Y",
  "12-13Y",
  "13-14Y",
  "14-15Y",
  "One Size",
] as const;

export const productTags = ["Bestseller", "New"] as const;
export type ProductTag = (typeof productTags)[number];

export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  size: string;
  barcode: string;
  stock: number | null;
  reservedStock?: number;
  damagedStock?: number;
}

export const productAttributeKeys = ["productType", "pattern", "neckType", "sleeveType", "ageGroup", "occasion"] as const;
export type ProductAttributeKey = (typeof productAttributeKeys)[number];
export type ProductAttributes = Partial<Record<ProductAttributeKey, string>>;

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku?: string;
  categoryId: string;
  category?: string;
  brandId?: string;
  brand?: string;
  supplierId?: string;
  subcategory?: string;
  gender: ProductGender;
  tag?: ProductTag;
  price: number;
  originalPrice?: number;
  costPrice: number;
  reorderLevel: number;
  shortDescription?: string;
  description?: string;
  fabric?: string;
  fit?: string;
  care?: string;
  images: string[];
  attributes?: ProductAttributes;
  colors: ProductColor[];
  variants: ProductVariant[];
  stock: number;
  inStock: boolean;
  lowStock: boolean;
  published: boolean;
  createdDate: string;
  detailsLoaded: boolean;
}

export const variantLabel = (v: Pick<ProductVariant, "color" | "size">) => `${v.color} · ${v.size}`;
