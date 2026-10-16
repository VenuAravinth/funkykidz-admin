import type { Product } from "@/types/product";

export interface StockRow {
  key: string;
  productId: string;
  variantId: string;
  name: string;
  barcode: string;
  categoryId: string;
  brandId?: string;
  supplierId?: string;
  size: string;
  color: string;
  available: number;
  tracked: boolean;
  minStock: number;
  price: number;
  costPrice: number;
}

export function buildStockRows(products: Product[]): StockRow[] {
  return products.flatMap((product) =>
    product.variants.map((variant) => ({
      key: variant.id,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      barcode: variant.barcode,
      categoryId: product.categoryId,
      brandId: product.brandId,
      supplierId: product.supplierId,
      size: variant.size,
      color: variant.color,
      available: variant.stock ?? 0,
      tracked: variant.stock !== null,
      minStock: product.reorderLevel,
      price: product.price,
      costPrice: product.costPrice,
    })),
  );
}

export function applyReservedStock(rows: StockRow[], products: Product[]): StockRow[] {
  const reservedById = new Map(products.flatMap((p) => p.variants.map((v) => [v.id, v.reservedStock ?? 0] as const)));
  return rows.map((row) => {
    const reserved = reservedById.get(row.variantId) ?? 0;
    return reserved > 0 ? { ...row, available: Math.max(0, row.available - reserved) } : row;
  });
}
