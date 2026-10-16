import { z } from "zod";
import { adjustmentReasons } from "@/types/stockAdjustment";

export const stockAdjustmentSchema = z.object({
  rowKey: z.string().min(1, { error: "Select a product." }),
  physicalStock: z.number({ error: "Enter the physical stock count." }).int().nonnegative({ error: "Physical stock can't be negative." }),
  reason: z.enum(adjustmentReasons, { error: "Select a reason." }),
  notes: z.string().trim().min(5, { error: "Add a short note (min 5 characters)." }).max(500),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
