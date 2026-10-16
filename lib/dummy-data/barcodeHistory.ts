import type { BarcodeBatch } from "@/types/barcode";

export const barcodeHistory: BarcodeBatch[] = [
  {
    id: "bc_1",
    productId: "prd_1",
    variantId: "var_1",
    barcode: "2000090000018",
    quantity: 20,
    generatedBy: "Anita Rao",
    generatedAt: "2026-08-18T10:15:00+05:30",
  },
  {
    id: "bc_2",
    productId: "prd_3",
    variantId: "var_4",
    barcode: "2000090000025",
    quantity: 15,
    generatedBy: "Demo User",
    generatedAt: "2026-08-20T14:30:00+05:30",
  },
  {
    id: "bc_3",
    productId: "prd_5",
    barcode: "2000090000032",
    quantity: 30,
    generatedBy: "Anita Rao",
    generatedAt: "2026-08-22T09:05:00+05:30",
  },
];
