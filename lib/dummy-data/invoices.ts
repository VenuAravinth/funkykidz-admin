import type { Invoice, InvoiceLineItem } from "@/types/invoice";

function items(...rows: Array<Omit<InvoiceLineItem, "id">>): InvoiceLineItem[] {
  return rows.map((r, i) => ({ id: `invitem_${i + 1}`, ...r }));
}

export const invoices: Invoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "INV-2026-00542",
    customerName: "Venu",
    customerPhone: "9876543210",
    status: "paid",
    createdDate: "2026-08-26",
    discountAmount: 100,
    gstPercent: 5,
    paidAmount: 2_202,
    salesOrderId: "so_1",
    salesperson: "Demo User",
    items: items(
      { product: "Kids Frock", quantity: 2, rate: 799 },
      { product: "Kids Shirt", quantity: 1, rate: 599 },
    ),
  },
  {
    id: "inv_2",
    invoiceNumber: "INV-2026-00541",
    customerName: "Priya",
    customerPhone: "9845123670",
    status: "partially_paid",
    createdDate: "2026-08-26",
    discountAmount: 0,
    gstPercent: 0,
    paidAmount: 4_000,
    salesOrderId: "so_2",
    salesperson: "Meera Pillai",
    items: items(
      { product: "School Uniform Set", quantity: 10, rate: 600 },
      { product: "Kids Canvas Sneakers", quantity: 2, rate: 1_100 },
    ),
  },
  {
    id: "inv_3",
    invoiceNumber: "INV-2026-00540",
    customerName: "Rainbow Kids Store",
    customerPhone: "9900112233",
    status: "issued",
    createdDate: "2026-08-24",
    discountAmount: 0,
    gstPercent: 12,
    paidAmount: 0,
    salesperson: "Karthik Iyer",
    items: items({ product: "School Uniform Set", quantity: 5, rate: 600 }),
  },
  {
    id: "inv_4",
    invoiceNumber: "INV-2026-00539",
    customerName: "Rainbow Kids Store",
    customerPhone: "9900112233",
    status: "draft",
    createdDate: "2026-08-25",
    discountAmount: 0,
    gstPercent: 12,
    paidAmount: 0,
    salesperson: "Karthik Iyer",
    items: items({ product: "Kids Canvas Sneakers", quantity: 6, rate: 1_200 }),
  },
  {
    id: "inv_5",
    invoiceNumber: "INV-2026-00538",
    customerName: "Bubblegum Fashion",
    customerPhone: "9811223344",
    status: "cancelled",
    createdDate: "2026-08-16",
    discountAmount: 0,
    gstPercent: 18,
    paidAmount: 0,
    salesOrderId: "so_5",
    salesperson: "Aisha Reddy",
    notes: "Cancelled along with the linked sales order.",
    items: items({ product: "Winter Hoodie", quantity: 6, rate: 600 }),
  },
  {
    id: "inv_6",
    invoiceNumber: "INV-2026-00537",
    customerName: "Sunny Days Kids",
    customerPhone: "9877001122",
    status: "overdue",
    createdDate: "2026-07-20",
    discountAmount: 0,
    gstPercent: 12,
    paidAmount: 0,
    salesperson: "Meera Pillai",
    items: items({ product: "Boys Denim Shorts", quantity: 8, rate: 400 }),
  },
  {
    id: "inv_7",
    invoiceNumber: "INV-2026-00536",
    customerName: "Cherub Kidswear",
    customerPhone: "9765432109",
    status: "refunded",
    createdDate: "2026-08-10",
    discountAmount: 50,
    gstPercent: 5,
    paidAmount: 0,
    salesperson: "Demo User",
    notes: "Refunded in full — product damaged in transit.",
    items: items({ product: "Infant Onesie Set", quantity: 6, rate: 650 }),
  },
  {
    id: "inv_8",
    invoiceNumber: "INV-2026-00543",
    customerName: "Aditi Rao",
    customerPhone: "9900112244",
    status: "paid",
    createdDate: "2026-08-27",
    discountAmount: 0,
    gstPercent: 12,
    paidAmount: 1_230,
    salesperson: "Karthik Iyer",
    paymentMethod: "Card",
    items: items({ product: "Cargo Shorts", quantity: 2, rate: 549 }),
  },
];

export function invoiceSubtotal(invoice: Invoice): number {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
}

export function invoiceGstAmount(invoice: Invoice): number {
  const taxable = invoiceSubtotal(invoice) - invoice.discountAmount;
  return Math.round(taxable * (invoice.gstPercent / 100));
}

export function invoiceGrandTotal(invoice: Invoice): number {
  const taxable = invoiceSubtotal(invoice) - invoice.discountAmount;
  return Math.round(taxable + invoiceGstAmount(invoice));
}

export function invoiceBalance(invoice: Invoice): number {
  return Math.max(invoiceGrandTotal(invoice) - invoice.paidAmount, 0);
}

export type InvoicePaymentLabel = "paid" | "partial" | "unpaid";

export function invoicePaymentLabel(invoice: Invoice): InvoicePaymentLabel {
  const total = invoiceGrandTotal(invoice);
  if (invoice.paidAmount >= total && total > 0) return "paid";
  if (invoice.paidAmount > 0) return "partial";
  return "unpaid";
}

export function getInvoiceById(id: string): Invoice | undefined {
  return invoices.find((i) => i.id === id);
}
