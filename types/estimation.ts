export type EstimationStatus = "draft" | "sent" | "viewed" | "converted" | "rejected" | "expired";

export interface EstimationLineItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface Estimation {
  id: string;
  estimationNumber: string;
  customerName: string;
  status: EstimationStatus;
  createdDate: string;
  validUntil: string;
  items: EstimationLineItem[];
  discount: number;
  tax: number;
  notes?: string;
}
