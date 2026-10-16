import type { Product } from "@/types/product";
import type { Invoice } from "@/types/invoice";
import type { OnlineOrder } from "@/types/onlineOrder";
import type { StockAdjustment } from "@/types/stockAdjustment";
import type { PurchaseOrder } from "@/types/supplier";
import type { AppNotification } from "@/types/notification";
import { suppliers, getSupplierById, purchaseOrders, supplierPayments } from "@/lib/dummy-data/suppliers";
import { getPayablesRows, getReceivablesRows } from "@/lib/finance";
import { suggestedOrderQty, poHref } from "@/lib/reorder";
import { formatCurrency, formatDate } from "@/lib/format";
import { invoiceSubtotal } from "@/lib/dummy-data/invoices";

const today = () => new Date().toISOString().slice(0, 10);

function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.round(ms / 86_400_000);
}

export function buildLowStockNotifications(products: Product[]): AppNotification[] {
  return products
    .filter((p) => !p.inStock || p.lowStock)
    .map((product) => {
      const supplier = product.supplierId ? getSupplierById(product.supplierId) : undefined;
      const isOut = !product.inStock;
      const isCritical = !isOut && product.stock <= product.reorderLevel / 2;

      return {
        id: `low_stock_${product.id}`,
        category: "low_stock",
        severity: isOut ? "muted" : isCritical ? "critical" : "warning",
        title: isOut ? "Out of Stock" : isCritical ? "Critical Stock" : "Low Stock",
        message: `${product.name} is ${isOut ? "out of stock and hidden from the website" : `at ${product.stock} units, below its reorder level of ${product.reorderLevel}`}.`,
        meta: [
          { label: "Current Stock", value: String(product.stock) },
          { label: "Reorder Level", value: String(product.reorderLevel) },
          { label: "Suggested Order", value: `${suggestedOrderQty(product)} units` },
          { label: "Supplier", value: supplier?.name ?? "—" },
          { label: "Last Purchase Price", value: formatCurrency(product.costPrice) },
        ],
        timestamp: new Date().toISOString(),
        href: "/inventory/low-stock",
        actions: [
          { label: "Create PO", href: poHref(product), variant: "primary" },
          { label: "View Product", href: "/inventory/low-stock" },
        ],
      } satisfies AppNotification;
    });
}

export function buildPoDeliveryNotifications(orders: PurchaseOrder[] = purchaseOrders): AppNotification[] {
  const t = today();
  return orders
    .filter((po) => po.status === "pending" || po.status === "partial")
    .map((po): AppNotification | undefined => {
      const overdueDays = daysBetween(po.expectedDeliveryDate, t);
      const isOverdue = overdueDays > 0;
      const isDueSoon = overdueDays >= -1 && overdueDays <= 0;
      if (!isOverdue && !isDueSoon) return undefined;

      const total = po.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * (1 + po.tax / 100);

      return {
        id: `po_delivery_${po.id}`,
        category: "po_delivery",
        severity: isOverdue ? "critical" : "warning",
        title: isOverdue ? "PO Overdue" : overdueDays === 0 ? "PO Delivery Today" : "PO Delivery Tomorrow",
        message: isOverdue
          ? `${po.poNumber} from ${po.supplierName} is ${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue.`
          : `${po.poNumber} from ${po.supplierName} is expected ${overdueDays === 0 ? "today" : "tomorrow"}.`,
        meta: [
          { label: "Supplier", value: po.supplierName },
          { label: "Expected", value: formatDate(po.expectedDeliveryDate) },
          { label: "Amount", value: formatCurrency(Math.round(total)) },
        ],
        timestamp: new Date(po.expectedDeliveryDate).toISOString(),
        href: `/purchase-orders/${po.id}`,
        actions: [
          { label: "View PO", href: `/purchase-orders/${po.id}`, variant: "primary" },
          { label: "Contact Supplier", href: `/suppliers/${po.supplierId}` },
          ...(isOverdue ? [{ label: "Mark Received", href: `/goods-received/new?poId=${po.id}` }] : []),
        ],
      };
    })
    .filter((n): n is AppNotification => !!n);
}

export function buildSupplierPaymentNotifications(): AppNotification[] {
  return getPayablesRows(supplierPayments)
    .filter((row) => daysBetween(row.dueDate, today()) >= -7)
    .map((row) => {
      const overdueDays = daysBetween(row.dueDate, today());
      const isOverdue = row.status === "overdue";
      const supplier = suppliers.find((s) => s.id === row.supplierId);

      return {
        id: `payment_due_${row.paymentId}`,
        category: "payment_due",
        severity: isOverdue ? "critical" : "warning",
        title: isOverdue ? "Payment Overdue" : "Payment Due",
        message: `${row.supplierName} — ${row.invoiceNumber}: ${formatCurrency(row.outstanding)} ${isOverdue ? `overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}` : `due ${formatDate(row.dueDate)}`}.`,
        meta: [
          { label: "Outstanding", value: formatCurrency(row.outstanding) },
          { label: "Due Date", value: formatDate(row.dueDate) },
        ],
        timestamp: new Date(row.dueDate).toISOString(),
        href: "/finance/payables",
        actions: [
          { label: "Pay Now", href: "/finance/payables", variant: "primary" },
          ...(supplier ? [{ label: "View Supplier", href: `/suppliers/${supplier.id}` }] : []),
        ],
      } satisfies AppNotification;
    });
}

export function buildCustomerPaymentNotifications(invoices: Invoice[]): AppNotification[] {
  return getReceivablesRows(invoices)
    .filter((row) => daysBetween(row.dueDate, today()) >= -7)
    .map((row) => {
      const overdueDays = daysBetween(row.dueDate, today());
      const isOverdue = row.status === "overdue";

      return {
        id: `customer_payment_due_${row.invoiceId}`,
        category: "customer_payment_due",
        severity: isOverdue ? "critical" : "warning",
        title: isOverdue ? "Customer Payment Overdue" : "Customer Payment Due",
        message: `${row.customerName} — ${row.invoiceNumber}: ${formatCurrency(row.outstanding)} ${isOverdue ? `overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}` : `due ${formatDate(row.dueDate)}`}.`,
        meta: [
          { label: "Outstanding", value: formatCurrency(row.outstanding) },
          { label: "Due Date", value: formatDate(row.dueDate) },
        ],
        timestamp: new Date(row.dueDate).toISOString(),
        href: `/customers/${encodeURIComponent(row.customerName)}`,
        actions: [
          { label: "Receive Payment", href: `/finance/receivables/${encodeURIComponent(row.customerName)}`, variant: "primary" },
          { label: "View Customer", href: `/customers/${encodeURIComponent(row.customerName)}` },
        ],
      } satisfies AppNotification;
    });
}

export function buildOnlineOrderNotifications(orders: OnlineOrder[]): AppNotification[] {
  return orders
    .filter((order) => order.status === "new" || order.status === "cancelled" || order.status === "returned")
    .slice(0, 8)
    .map((order) => {
      const amount = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
      const isException = order.status === "cancelled" || order.status === "returned";

      return {
        id: `online_order_${order.id}`,
        category: "online_order",
        severity: isException ? "warning" : "success",
        title: order.status === "cancelled" ? "Order Cancelled" : order.status === "returned" ? "Order Returned" : "New Online Order",
        message: `${order.orderNumber} — ${order.customerName}, ${order.items.length} item${order.items.length === 1 ? "" : "s"}, ${formatCurrency(amount)}.`,
        meta: [
          { label: "Items", value: String(order.items.length) },
          { label: "Amount", value: formatCurrency(amount) },
          { label: "Payment", value: order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "failed" ? "Failed" : "Pending" },
        ],
        timestamp: new Date(order.timeline.at(-1)?.at ?? order.createdDate).toISOString(),
        href: `/sales/online-orders/${order.id}`,
        actions: [{ label: order.status === "new" ? "Process Order" : "View Order", href: `/sales/online-orders/${order.id}`, variant: "primary" }],
      } satisfies AppNotification;
    });
}

export function buildStockAdjustmentNotifications(adjustments: StockAdjustment[]): AppNotification[] {
  return adjustments
    .filter((adj) => adj.difference < 0)
    .slice(0, 5)
    .map((adj) => ({
      id: `system_adjustment_${adj.id}`,
      category: "system",
      severity: "muted",
      title: "Stock Adjusted",
      message: `${adj.productName}: ${adj.difference} units (${adj.reason}), by ${adj.requestedBy}.`,
      meta: [
        { label: "Quantity", value: String(adj.difference) },
        { label: "Reason", value: adj.reason },
        { label: "By", value: adj.requestedBy },
      ],
      timestamp: adj.requestedAt,
      href: "/inventory/stock-adjustment",
      actions: [{ label: "View Adjustment", href: "/inventory/stock-adjustment" }],
    }) satisfies AppNotification);
}

export function buildHighDiscountNotifications(invoices: Invoice[]): AppNotification[] {
  return invoices
    .map((inv): AppNotification | undefined => {
      const subtotal = invoiceSubtotal(inv);
      const percent = subtotal > 0 ? (inv.discountAmount / subtotal) * 100 : 0;
      if (percent < 15) return undefined;

      return {
        id: `system_discount_${inv.id}`,
        category: "system",
        severity: "warning",
        title: "High Discount Applied",
        message: `${inv.invoiceNumber}: ${percent.toFixed(0)}% discount by ${inv.salesperson ?? "Demo User"}.`,
        meta: [
          { label: "Invoice", value: inv.invoiceNumber },
          { label: "Discount", value: `${percent.toFixed(0)}%` },
          { label: "Cashier", value: inv.salesperson ?? "Demo User" },
        ],
        timestamp: new Date(inv.createdDate).toISOString(),
        href: `/sales/invoices/${inv.id}`,
        actions: [{ label: "View Invoice", href: `/sales/invoices/${inv.id}` }],
      };
    })
    .filter((n): n is AppNotification => !!n)
    .slice(0, 5);
}

export interface NotificationSources {
  products: Product[];
  invoices: Invoice[];
  onlineOrders: OnlineOrder[];
  stockAdjustments: StockAdjustment[];
}

export function buildNotifications(sources: NotificationSources): AppNotification[] {
  const all = [
    ...buildLowStockNotifications(sources.products),
    ...buildPoDeliveryNotifications(),
    ...buildSupplierPaymentNotifications(),
    ...buildCustomerPaymentNotifications(sources.invoices),
    ...buildOnlineOrderNotifications(sources.onlineOrders),
    ...buildStockAdjustmentNotifications(sources.stockAdjustments),
    ...buildHighDiscountNotifications(sources.invoices),
  ];

  const severityRank: Record<AppNotification["severity"], number> = { critical: 0, warning: 1, muted: 2, info: 3, success: 4 };
  return all.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || (a.timestamp < b.timestamp ? 1 : -1));
}
