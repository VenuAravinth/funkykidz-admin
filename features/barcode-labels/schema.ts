import { z } from "zod";

export const generateBarcodeSchema = z.object({
  productId: z.string().min(1, { error: "Select a product." }),
  variantId: z.string().min(1, { error: "Select a colour and size." }),
  quantity: z
    .number({ error: "Quantity is required." })
    .min(1, { error: "Quantity must be at least 1." })
    .max(500, { error: "Keep batches to 500 labels or fewer." }),
});

export type GenerateBarcodeInput = z.infer<typeof generateBarcodeSchema>;
