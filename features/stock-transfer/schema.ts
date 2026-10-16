import { z } from "zod";

export const transferReasons = [
  "Stock Rebalancing",
  "New Branch Stocking",
  "Seasonal Demand Shift",
  "Damaged Stock Return",
  "Other",
] as const;

export const stockTransferSchema = z
  .object({
    fromLocationId: z.string().min(1, { error: "Select a source location." }),
    toLocationId: z.string().min(1, { error: "Select a destination location." }),
    productId: z.string().min(1, { error: "Select a product." }),
    quantity: z.number({ error: "Quantity is required." }).min(1, { error: "Quantity must be at least 1." }),
    reason: z.string().min(1, { error: "Select a reason." }),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    error: "From and To locations must be different.",
    path: ["toLocationId"],
  });

export type StockTransferInput = z.infer<typeof stockTransferSchema>;
