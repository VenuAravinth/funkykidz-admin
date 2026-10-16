import type { SalesOrder, SalesOrderLineItem } from "@/types/salesOrder";

function items(...rows: Array<Omit<SalesOrderLineItem, "id">>): SalesOrderLineItem[] {
  return rows.map((r, i) => ({ id: `soitem_${i + 1}`, ...r }));
}

export const salesOrders: SalesOrder[] = [
  {
    id: "so_1",
    soNumber: "SO-1052",
    customerName: "Venu",
    status: "completed",
    fulfillmentStatus: "ready",
    paymentStatus: "paid",
    paidAmount: 5_500,
    createdDate: "2026-08-26",
    deliveryDate: "2026-08-27",
    discount: 0,
    tax: 0,
    items: items({ product: "Girls Party Dress", quantity: 5, unitPrice: 1_100 }),
  },
  {
    id: "so_2",
    soNumber: "SO-1051",
    customerName: "Priya",
    status: "processing",
    fulfillmentStatus: "pending",
    paymentStatus: "partial",
    paidAmount: 4_000,
    createdDate: "2026-08-26",
    deliveryDate: "2026-09-02",
    discount: 0,
    tax: 0,
    items: items(
      { product: "School Uniform Set", quantity: 10, unitPrice: 600 },
      { product: "Kids Canvas Sneakers", quantity: 2, unitPrice: 1_100 },
    ),
  },
  {
    id: "so_3",
    soNumber: "SO-1050",
    customerName: "Little Stars Retail",
    status: "confirmed",
    fulfillmentStatus: "processing",
    paymentStatus: "pending",
    paidAmount: 0,
    createdDate: "2026-08-22",
    deliveryDate: "2026-09-05",
    discount: 10,
    tax: 5,
    quotationId: "quo_1",
    items: items(
      { product: "Cotton Printed Frock", quantity: 10, unitPrice: 500 },
      { product: "Boys Denim Shorts", quantity: 10, unitPrice: 400 },
    ),
  },
  {
    id: "so_4",
    soNumber: "SO-1049",
    customerName: "Rainbow Kids Store",
    status: "draft",
    fulfillmentStatus: "pending",
    paymentStatus: "pending",
    paidAmount: 0,
    createdDate: "2026-08-24",
    deliveryDate: "2026-09-07",
    discount: 0,
    tax: 0,
    items: items({ product: "School Uniform Set", quantity: 5, unitPrice: 600 }),
  },
  {
    id: "so_5",
    soNumber: "SO-1048",
    customerName: "Bubblegum Fashion",
    status: "cancelled",
    fulfillmentStatus: "pending",
    paymentStatus: "pending",
    paidAmount: 0,
    createdDate: "2026-08-16",
    deliveryDate: "2026-08-30",
    discount: 0,
    tax: 0,
    notes: "Cancelled at customer's request before dispatch.",
    items: items({ product: "Winter Hoodie", quantity: 6, unitPrice: 600 }),
  },
  {
    id: "so_6",
    soNumber: "SO-1047",
    customerName: "Tiny Trends Boutique",
    status: "partially_fulfilled",
    fulfillmentStatus: "partially_fulfilled",
    paymentStatus: "partial",
    paidAmount: 2_000,
    createdDate: "2026-08-19",
    deliveryDate: "2026-08-28",
    discount: 0,
    tax: 0,
    notes: "9 of 15 units shipped; remainder on backorder.",
    items: items({ product: "Unisex Graphic Tee", quantity: 15, unitPrice: 300 }),
  },
  {
    id: "so_7",
    soNumber: "SO-1046",
    customerName: "Sunny Days Kids",
    status: "ready",
    fulfillmentStatus: "ready",
    paymentStatus: "paid",
    paidAmount: 3_200,
    createdDate: "2026-08-18",
    deliveryDate: "2026-08-29",
    discount: 0,
    tax: 0,
    items: items({ product: "Boys Denim Shorts", quantity: 8, unitPrice: 400 }),
  },
];

export function salesOrderSubtotal(order: SalesOrder): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function salesOrderTotal(order: SalesOrder): number {
  const subtotal = salesOrderSubtotal(order);
  const discounted = subtotal * (1 - order.discount / 100);
  return Math.round(discounted * (1 + order.tax / 100));
}

export function getSalesOrderById(id: string): SalesOrder | undefined {
  return salesOrders.find((o) => o.id === id);
}
