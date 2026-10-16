export type QuotationStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";

export interface QuotationLineItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  salesperson: string;
  status: QuotationStatus;
  createdDate: string;
  validUntil: string;
  items: QuotationLineItem[];
  discount: number;
  tax: number;
  notes?: string;
  estimationId?: string;
}
