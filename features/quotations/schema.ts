import { z } from "zod";

export const quotationItemSchema = z.object({
  product: z.string().trim().min(2, { error: "Product name is required." }),
  quantity: z.number({ error: "Quantity is required." }).min(1, { error: "Quantity must be at least 1." }),
  unitPrice: z.number({ error: "Price is required." }).min(0, { error: "Price can't be negative." }),
});

export const quotationSchema = z.object({
  customerName: z.string().trim().min(2, { error: "Customer name is required." }).max(120),
  salesperson: z.string().trim().min(2, { error: "Salesperson is required." }).max(80),
  validUntil: z.string().min(1, { error: "Validity date is required." }),
  discount: z.number({ error: "Discount is required." }).min(0).max(100),
  tax: z.number({ error: "Tax is required." }).min(0).max(100),
  notes: z.string().trim().max(500).optional(),
  items: z.array(quotationItemSchema).min(1, { error: "Add at least one product." }),
});

export type QuotationItemInput = z.infer<typeof quotationItemSchema>;
export type QuotationInput = z.infer<typeof quotationSchema>;
