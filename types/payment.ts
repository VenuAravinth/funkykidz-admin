export const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Credit"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type PaymentType = "full" | "partial" | "credit" | "refund" | "reversal";
export type PaymentStatus = "paid" | "pending" | "refunded" | "reversed";

export interface PaymentSplitEntry {
  method: PaymentMethod;
  amount: number;
}

export interface CustomerPayment {
  id: string;
  paymentNumber: string;
  invoiceId?: string;
  invoiceNumber: string;
  customerName: string;
  method: PaymentMethod | "Split";
  splitBreakdown?: PaymentSplitEntry[];
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  date: string;
  notes?: string;
}
