import { z } from "zod";

export const paymentMethods = ["Bank Transfer", "Cheque", "UPI", "Cash"] as const;

export const recordPaymentSchema = z.object({
  amount: z.number({ error: "Enter a payment amount." }).min(1, { error: "Enter a payment amount." }),
  method: z.enum(paymentMethods, { error: "Select a payment method." }),
  paidDate: z.string().min(1, { error: "Payment date is required." }),
  notes: z.string().trim().max(500).optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
