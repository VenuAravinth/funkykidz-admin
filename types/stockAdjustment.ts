export const adjustmentReasons = [
  "Damaged",
  "Lost",
  "Theft",
  "Counting Mistake",
  "Found Stock",
  "Expired",
  "Opening Stock",
  "Other",
] as const;

export type AdjustmentReason = (typeof adjustmentReasons)[number];

export type AdjustmentStatus = "approved" | "pending" | "rejected";

export interface StockAdjustment {
  id: string;
  productId: string;
  variantId?: string;
  barcode: string;
  productName: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  reason: AdjustmentReason;
  notes: string;
  requestedBy: string;
  requestedAt: string;
  requiresApproval: boolean;
  status: AdjustmentStatus;
  approvedBy?: string;
  approvedAt?: string;
}
