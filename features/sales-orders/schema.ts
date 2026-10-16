import { z } from "zod";

export const salesOrderItemSchema = z.object({
  product: z.string().trim().min(2, { error: "Product name is required." }),
  quantity: z.number({ error: "Quantity is required." }).min(1, { error: "Quantity must be at least 1." }),
  unitPrice: z.number({ error: "Price is required." }).min(0, { error: "Price can't be negative." }),
});

export const salesOrderSchema = z.object({
  customerName: z.string().trim().min(2, { error: "Customer name is required." }).max(120),
  deliveryDate: z.string().min(1, { error: "Delivery date is required." }),
  paymentStatus: z.enum(["pending", "partial", "paid"], { error: "Select a payment status." }),
  paidAmount: z.number({ error: "Paid amount is required." }).min(0, { error: "Paid amount can't be negative." }),
  discount: z.number({ error: "Discount is required." }).min(0).max(100),
  tax: z.number({ error: "Tax is required." }).min(0).max(100),
  notes: z.string().trim().max(500).optional(),
  items: z.array(salesOrderItemSchema).min(1, { error: "Add at least one product." }),
});

export type SalesOrderItemInput = z.infer<typeof salesOrderItemSchema>;
export type SalesOrderInput = z.infer<typeof salesOrderSchema>;
