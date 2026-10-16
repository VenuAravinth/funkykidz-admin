import { z } from "zod";

export const poItemSchema = z.object({
  description: z.string().trim().min(2, { error: "Item description is required." }),
  barcode: z.string().trim().max(40),
  quantity: z.number({ error: "Quantity is required." }).min(1, { error: "Quantity must be at least 1." }),
  unitPrice: z.number({ error: "Unit price is required." }).min(0, { error: "Unit price can't be negative." }),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, { error: "Select a supplier." }),
  expectedDeliveryDate: z.string().min(1, { error: "Expected delivery date is required." }),
  tax: z.number({ error: "Tax is required." }).min(0).max(100),
  notes: z.string().trim().max(500).optional(),
  items: z.array(poItemSchema).min(1, { error: "Add at least one line item." }),
});

export type POItemInput = z.infer<typeof poItemSchema>;
export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
