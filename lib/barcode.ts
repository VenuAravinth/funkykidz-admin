import { variantLabel, type Product, type ProductVariant } from "@/types/product";

const INTERNAL_PREFIX = "20";

export function ean13CheckDigit(first12: string): number {
  const sum = [...first12].reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

export function isValidEan13(code: string): boolean {
  return /^\d{13}$/.test(code) && ean13CheckDigit(code.slice(0, 12)) === Number(code[12]);
}

export function internalBarcode(sequence: number): string {
  const first12 = INTERNAL_PREFIX + String(sequence).padStart(10, "0");
  return first12 + ean13CheckDigit(first12);
}

function sequenceOf(code: string | undefined): number {
  return code && code.startsWith(INTERNAL_PREFIX) && isValidEan13(code) ? Number(code.slice(2, 12)) : 0;
}

export function barcodeSequence(code: string): number {
  return sequenceOf(code);
}

export interface CodeMatch {
  product: Product;
  variant: ProductVariant;
}

export function findByCode(code: string, products: Product[]): CodeMatch | undefined {
  const value = code.trim();
  if (!value) return undefined;
  for (const product of products) {
    const variant = product.variants.find((v) => v.barcode === value);
    if (variant) return { product, variant };
  }
  return undefined;
}

export interface SellableUnit {
  key: string;
  productName: string;
  variantLabel: string;
  barcode: string;
  price: number;
  stock: number | null;
}

export function sellableUnits(product: Product): SellableUnit[] {
  return product.variants.map((v) => ({
    key: v.id,
    productName: product.name,
    variantLabel: variantLabel(v),
    barcode: v.barcode,
    price: product.price,
    stock: v.stock,
  }));
}
