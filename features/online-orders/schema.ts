import { z } from "zod";

export const onlineOrderItemSchema = z.object({
  rowKey: z.string().min(1, { error: "Select a product." }),
  quantity: z.number({ error: "Quantity is required." }).min(1, { error: "Quantity must be at least 1." }),
});

export const onlineOrderSchema = z.object({
  customerName: z.string().trim().min(2, { error: "Customer name is required." }).max(120),
  phone: z.string().trim().min(7, { error: "Enter a valid phone number." }).max(20),
  address: z.string().trim().min(5, { error: "Delivery address is required." }).max(300),
  paymentMethod: z.string().trim().min(2, { error: "Select a payment method." }),
  shippingMethod: z.string().trim().min(2, { error: "Select a shipping method." }),
  items: z.array(onlineOrderItemSchema).min(1, { error: "Add at least one product." }),
});

export type OnlineOrderItemInput = z.infer<typeof onlineOrderItemSchema>;
export type OnlineOrderInput = z.infer<typeof onlineOrderSchema>;
