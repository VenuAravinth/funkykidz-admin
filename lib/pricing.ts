export function discountPercent(originalPrice: number | undefined, sellingPrice: number): number {
  if (!originalPrice || originalPrice <= sellingPrice || originalPrice <= 0) return 0;
  return Math.floor(((originalPrice - sellingPrice) / originalPrice) * 100);
}
