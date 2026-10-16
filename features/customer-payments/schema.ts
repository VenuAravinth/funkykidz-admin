import { z } from "zod";

export const customerPaymentSchema = z.object({
  invoiceId: z.string().optional(),
  customerName: z.string().trim().min(2, { error: "Customer name is required." }).max(120),
  amount: z.number({ error: "Amount is required." }).min(1, { error: "Enter a payment amount." }),
  type: z.enum(["full", "partial", "credit"], { error: "Select a payment type." }),
  notes: z.string().trim().max(500).optional(),
});

export type CustomerPaymentInput = z.infer<typeof customerPaymentSchema>;
