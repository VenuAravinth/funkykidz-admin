export const ONLINE_ORDER_STATUSES = [
  "new",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
] as const;
export type OnlineOrderStatus = (typeof ONLINE_ORDER_STATUSES)[number];

export const ONLINE_ORDER_FLOW: OnlineOrderStatus[] = [
  "new",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export type OrderPaymentStatus = "pending" | "paid" | "failed";

export interface OnlineOrderLineItem {
  id: string;
  productId: string;
  variantId?: string;
  barcode: string;
  product: string;
  quantity: number;
  price: number;
}

export interface OrderTimelineEntry {
  status: OnlineOrderStatus;
  at: string;
  note?: string;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  items: OnlineOrderLineItem[];
  status: OnlineOrderStatus;
  paymentMethod: string;
  paymentStatus: OrderPaymentStatus;
  shippingMethod: string;
  trackingNumber?: string;
  createdDate: string;
  timeline: OrderTimelineEntry[];
  stockFulfilled: boolean;
}
