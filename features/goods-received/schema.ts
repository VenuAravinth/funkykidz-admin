import { z } from "zod";

export const receiptItemSchema = z.object({
  description: z.string(),
  orderedQty: z.number(),
  receivedQty: z.number({ error: "Required." }).min(0, { error: "Can't be negative." }),
  damagedQty: z.number({ error: "Required." }).min(0, { error: "Can't be negative." }),
  missingQty: z.number({ error: "Required." }).min(0, { error: "Can't be negative." }),
});

export const goodsReceiptSchema = z.object({
  receiptType: z.enum(["full", "partial", "damaged"]),
  receivedDate: z.string().min(1, { error: "Received date is required." }),
  receivedBy: z.string().trim().min(2, { error: "Enter who received the stock." }),
  remarks: z.string().trim().max(500).optional(),
  items: z.array(receiptItemSchema).min(1),
});

export type GoodsReceiptInput = z.infer<typeof goodsReceiptSchema>;
