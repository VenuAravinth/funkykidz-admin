import { z } from "zod";

export const invoiceItemSchema = z.object({
  product: z.string().trim().min(2, { error: "Product name is required." }),
  quantity: z.number({ error: "Quantity is required." }).min(1, { error: "Quantity must be at least 1." }),
  rate: z.number({ error: "Rate is required." }).min(0, { error: "Rate can't be negative." }),
});

export const invoiceSchema = z.object({
  customerName: z.string().trim().min(2, { error: "Customer name is required." }).max(120),
  customerPhone: z.string().trim().min(7, { error: "Enter a valid phone number." }).max(20),
  discountAmount: z.number({ error: "Discount is required." }).min(0, { error: "Discount can't be negative." }),
  gstPercent: z.number({ error: "GST is required." }).min(0).max(100),
  paidAmount: z.number({ error: "Paid amount is required." }).min(0, { error: "Paid amount can't be negative." }),
  notes: z.string().trim().max(500).optional(),
  items: z.array(invoiceItemSchema).min(1, { error: "Add at least one product." }),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
