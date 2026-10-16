export type OrderStatus = "draft" | "confirmed" | "processing" | "ready" | "partially_fulfilled" | "completed" | "cancelled";

export type FulfillmentStatus = "pending" | "processing" | "ready" | "partially_fulfilled" | "fulfilled";

export type OrderPaymentStatus = "pending" | "partial" | "paid";

export interface SalesOrderLineItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  customerName: string;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentStatus: OrderPaymentStatus;
  paidAmount: number;
  createdDate: string;
  deliveryDate: string;
  items: SalesOrderLineItem[];
  discount: number;
  tax: number;
  notes?: string;
  quotationId?: string;
}
