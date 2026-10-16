import { z } from "zod";

export const estimationItemSchema = z.object({
  product: z.string().trim().min(2, { error: "Product name is required." }),
  quantity: z.number({ error: "Quantity is required." }).min(1, { error: "Quantity must be at least 1." }),
  unitPrice: z.number({ error: "Price is required." }).min(0, { error: "Price can't be negative." }),
});

export const estimationSchema = z.object({
  customerName: z.string().trim().min(2, { error: "Customer name is required." }).max(120),
  validUntil: z.string().min(1, { error: "Validity date is required." }),
  discount: z.number({ error: "Discount is required." }).min(0).max(100),
  tax: z.number({ error: "Tax is required." }).min(0).max(100),
  notes: z.string().trim().max(500).optional(),
  items: z.array(estimationItemSchema).min(1, { error: "Add at least one product." }),
});

export type EstimationItemInput = z.infer<typeof estimationItemSchema>;
export type EstimationInput = z.infer<typeof estimationSchema>;
