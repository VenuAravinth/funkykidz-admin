import type { Estimation, EstimationLineItem } from "@/types/estimation";

function items(...rows: Array<Omit<EstimationLineItem, "id">>): EstimationLineItem[] {
  return rows.map((r, i) => ({ id: `eitem_${i + 1}`, ...r }));
}

export const estimations: Estimation[] = [
  {
    id: "est_1",
    estimationNumber: "EST-1025",
    customerName: "Venu",
    status: "draft",
    createdDate: "2026-08-26",
    validUntil: "2026-09-09",
    discount: 15,
    tax: 0,
    items: items({ product: "Girls Party Dress", quantity: 5, unitPrice: 1_000 }),
  },
  {
    id: "est_2",
    estimationNumber: "EST-1024",
    customerName: "Priya",
    status: "sent",
    createdDate: "2026-08-26",
    validUntil: "2026-09-09",
    discount: 0,
    tax: 0,
    items: items(
      { product: "Infant Onesie Set", quantity: 4, unitPrice: 650 },
      { product: "Kids Canvas Sneakers", quantity: 4, unitPrice: 1_300 },
    ),
  },
  {
    id: "est_3",
    estimationNumber: "EST-1023",
    customerName: "Rainbow Kids Store",
    status: "viewed",
    createdDate: "2026-08-24",
    validUntil: "2026-09-07",
    discount: 5,
    tax: 12,
    notes: "Bulk order for the September school-reopening drive.",
    items: items(
      { product: "School Uniform Set", quantity: 12, unitPrice: 600 },
      { product: "Kids Canvas Sneakers", quantity: 6, unitPrice: 1_200 },
    ),
  },
  {
    id: "est_4",
    estimationNumber: "EST-1022",
    customerName: "Little Stars Retail",
    status: "converted",
    createdDate: "2026-08-20",
    validUntil: "2026-09-03",
    discount: 10,
    tax: 5,
    items: items(
      { product: "Cotton Printed Frock", quantity: 10, unitPrice: 500 },
      { product: "Boys Denim Shorts", quantity: 10, unitPrice: 400 },
    ),
  },
  {
    id: "est_5",
    estimationNumber: "EST-1021",
    customerName: "Bubblegum Fashion",
    status: "rejected",
    createdDate: "2026-08-18",
    validUntil: "2026-09-01",
    discount: 0,
    tax: 18,
    notes: "Customer went with another vendor on pricing.",
    items: items({ product: "Winter Hoodie", quantity: 6, unitPrice: 600 }),
  },
  {
    id: "est_6",
    estimationNumber: "EST-1020",
    customerName: "Tiny Trends Boutique",
    status: "expired",
    createdDate: "2026-07-28",
    validUntil: "2026-08-11",
    discount: 0,
    tax: 12,
    items: items(
      { product: "Unisex Graphic Tee", quantity: 15, unitPrice: 300 },
      { product: "Girls Party Dress", quantity: 3, unitPrice: 1_000 },
    ),
  },
  {
    id: "est_7",
    estimationNumber: "EST-1019",
    customerName: "Cherub Kidswear",
    status: "draft",
    createdDate: "2026-08-25",
    validUntil: "2026-09-08",
    discount: 0,
    tax: 0,
    items: items({ product: "Infant Onesie Set", quantity: 6, unitPrice: 650 }),
  },
  {
    id: "est_8",
    estimationNumber: "EST-1018",
    customerName: "Sunny Days Kids",
    status: "sent",
    createdDate: "2026-08-22",
    validUntil: "2026-09-05",
    discount: 5,
    tax: 12,
    items: items(
      { product: "Boys Denim Shorts", quantity: 8, unitPrice: 400 },
      { product: "Kids Canvas Sneakers", quantity: 2, unitPrice: 1_200 },
    ),
  },
];

export function estimationSubtotal(estimation: Estimation): number {
  return estimation.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function estimationTotal(estimation: Estimation): number {
  const subtotal = estimationSubtotal(estimation);
  const discounted = subtotal * (1 - estimation.discount / 100);
  return Math.round(discounted * (1 + estimation.tax / 100));
}

export function estimationItemCount(estimation: Estimation): number {
  return estimation.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getEstimationById(id: string): Estimation | undefined {
  return estimations.find((e) => e.id === id);
}
