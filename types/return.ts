export type ReturnStatus = "pending" | "approved" | "rejected" | "refunded";

export const RETURN_REASONS = [
  "Wrong size",
  "Wrong product",
  "Damaged",
  "Defective",
  "Customer changed mind",
  "Wrong color",
  "Other",
] as const;
export type ReturnReason = (typeof RETURN_REASONS)[number];

export const REFUND_METHODS = ["Cash", "UPI", "Original payment method", "Store credit"] as const;
export type RefundMethod = (typeof REFUND_METHODS)[number];

export type InspectionResult = "good" | "damaged";

export interface SalesReturn {
  id: string;
  returnNumber: string;
  invoiceId?: string;
  invoiceNumber: string;
  customerName: string;
  productId: string;
  variantId?: string;
  barcode: string;
  product: string;
  quantity: number;
  amount: number;
  reason: ReturnReason;
  notes?: string;
  status: ReturnStatus;
  inspectionResult?: InspectionResult;
  refundMethod?: RefundMethod;
  createdDate: string;
}
