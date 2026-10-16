import type { Quotation, QuotationLineItem } from "@/types/quotation";

function items(...rows: Array<Omit<QuotationLineItem, "id">>): QuotationLineItem[] {
  return rows.map((r, i) => ({ id: `qitem_${i + 1}`, ...r }));
}

export const salespeople = ["Aisha Reddy", "Karthik Iyer", "Meera Pillai", "Demo User"];

export const quotations: Quotation[] = [
  {
    id: "quo_1",
    quotationNumber: "QUO-1031",
    customerName: "Little Stars Retail",
    salesperson: "Aisha Reddy",
    status: "accepted",
    createdDate: "2026-08-21",
    validUntil: "2026-09-04",
    discount: 10,
    tax: 5,
    estimationId: "est_4",
    items: items(
      { product: "Cotton Printed Frock", quantity: 10, unitPrice: 500 },
      { product: "Boys Denim Shorts", quantity: 10, unitPrice: 400 },
    ),
  },
  {
    id: "quo_2",
    quotationNumber: "QUO-1030",
    customerName: "Rainbow Kids Store",
    salesperson: "Karthik Iyer",
    status: "sent",
    createdDate: "2026-08-25",
    validUntil: "2026-09-08",
    discount: 5,
    tax: 12,
    notes: "Bulk order for the September school-reopening drive.",
    items: items(
      { product: "School Uniform Set", quantity: 12, unitPrice: 600 },
      { product: "Kids Canvas Sneakers", quantity: 6, unitPrice: 1_200 },
    ),
  },
  {
    id: "quo_3",
    quotationNumber: "QUO-1029",
    customerName: "Tiny Trends Boutique",
    salesperson: "Meera Pillai",
    status: "viewed",
    createdDate: "2026-08-23",
    validUntil: "2026-09-06",
    discount: 0,
    tax: 12,
    items: items(
      { product: "Unisex Graphic Tee", quantity: 15, unitPrice: 300 },
      { product: "Girls Party Dress", quantity: 3, unitPrice: 1_000 },
    ),
  },
  {
    id: "quo_4",
    quotationNumber: "QUO-1028",
    customerName: "Bubblegum Fashion",
    salesperson: "Aisha Reddy",
    status: "rejected",
    createdDate: "2026-08-15",
    validUntil: "2026-08-29",
    discount: 0,
    tax: 18,
    notes: "Customer went with another vendor on pricing.",
    items: items({ product: "Winter Hoodie", quantity: 6, unitPrice: 600 }),
  },
  {
    id: "quo_5",
    quotationNumber: "QUO-1027",
    customerName: "Cherub Kidswear",
    salesperson: "Karthik Iyer",
    status: "draft",
    createdDate: "2026-08-26",
    validUntil: "2026-09-09",
    discount: 0,
    tax: 0,
    items: items({ product: "Infant Onesie Set", quantity: 6, unitPrice: 650 }),
  },
  {
    id: "quo_6",
    quotationNumber: "QUO-1026",
    customerName: "Sunny Days Kids",
    salesperson: "Meera Pillai",
    status: "expired",
    createdDate: "2026-07-20",
    validUntil: "2026-08-03",
    discount: 5,
    tax: 12,
    items: items(
      { product: "Boys Denim Shorts", quantity: 8, unitPrice: 400 },
      { product: "Kids Canvas Sneakers", quantity: 2, unitPrice: 1_200 },
    ),
  },
];

export function quotationSubtotal(quotation: Quotation): number {
  return quotation.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function quotationTotal(quotation: Quotation): number {
  const subtotal = quotationSubtotal(quotation);
  const discounted = subtotal * (1 - quotation.discount / 100);
  return Math.round(discounted * (1 + quotation.tax / 100));
}

export function getQuotationById(id: string): Quotation | undefined {
  return quotations.find((q) => q.id === id);
}
