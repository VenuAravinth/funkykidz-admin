import type { Product } from "@/types/product";

export function suggestedOrderQty(product: Product): number {
  return Math.max(product.reorderLevel * 2 - product.stock, 1);
}

export function poHref(product: Product): string {
  const params = new URLSearchParams({
    supplierId: product.supplierId ?? "",
    description: product.name,
    qty: String(suggestedOrderQty(product)),
    price: String(product.costPrice),
  });
  return `/purchase-orders/new?${params.toString()}`;
}
