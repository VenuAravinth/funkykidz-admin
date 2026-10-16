export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled" | "refunded";

export interface InvoiceLineItem {
  id: string;
  product: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  status: InvoiceStatus;
  createdDate: string;
  items: InvoiceLineItem[];
  discountAmount: number;
  gstPercent: number;
  paidAmount: number;
  notes?: string;
  salesOrderId?: string;
  paymentMethod?: string;
  salesperson?: string;
}
