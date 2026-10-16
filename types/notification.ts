export type NotificationCategory =
  | "low_stock"
  | "po_delivery"
  | "payment_due"
  | "customer_payment_due"
  | "online_order"
  | "system";

export type NotificationSeverity = "success" | "info" | "warning" | "critical" | "muted";

export interface NotificationAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

export interface NotificationMetaEntry {
  label: string;
  value: string;
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  meta?: NotificationMetaEntry[];
  timestamp: string;
  href?: string;
  actions: NotificationAction[];
}

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  low_stock: "Low Stock",
  po_delivery: "PO Delivery",
  payment_due: "Payment Due",
  customer_payment_due: "Customer Payment",
  online_order: "Online Orders",
  system: "System",
};
