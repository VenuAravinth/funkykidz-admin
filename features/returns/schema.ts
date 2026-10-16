import { z } from "zod";
import { RETURN_REASONS } from "@/types/return";

export const returnSchema = z.object({
  invoiceId: z.string().optional(),
  rowKey: z.string().min(1, { error: "Select a product." }),
  quantity: z.number({ error: "Quantity is required." }).min(1, { error: "Quantity must be at least 1." }),
  amount: z.number({ error: "Amount is required." }).min(0, { error: "Amount can't be negative." }),
  reason: z.enum(RETURN_REASONS, { error: "Select a reason." }),
  notes: z.string().trim().max(500).optional(),
});

export type ReturnInput = z.infer<typeof returnSchema>;
