import type { Invoice } from "@/types/invoice";
import type { Product, Category } from "@/types/product";
import type { PurchaseOrder } from "@/types/supplier";
import { invoiceSubtotal, invoiceGstAmount } from "@/lib/dummy-data/invoices";
import { poSubtotal, poTotal } from "@/lib/dummy-data/suppliers";

const EXCLUDED_STATUSES = new Set(["draft", "cancelled", "refunded"]);

function billableInvoices(invoices: Invoice[]): Invoice[] {
  return invoices.filter((i) => !EXCLUDED_STATUSES.has(i.status));
}

function taxableAmount(invoice: Invoice): number {
  return invoiceSubtotal(invoice) - invoice.discountAmount;
}

export interface GstSummary {
  taxableSales: number;
  cgst: number;
  sgst: number;
  totalGstCollected: number;
}

export function computeGstSummary(invoices: Invoice[]): GstSummary {
  const rows = billableInvoices(invoices);
  const taxableSales = rows.reduce((sum, i) => sum + taxableAmount(i), 0);
  const totalGstCollected = rows.reduce((sum, i) => sum + invoiceGstAmount(i), 0);
  return { taxableSales, cgst: totalGstCollected / 2, sgst: totalGstCollected / 2, totalGstCollected };
}

export interface TaxRateRow {
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export function computeSalesByRate(invoices: Invoice[]): TaxRateRow[] {
  const map = new Map<number, TaxRateRow>();
  for (const inv of billableInvoices(invoices)) {
    const existing = map.get(inv.gstPercent);
    const taxable = taxableAmount(inv);
    const tax = invoiceGstAmount(inv);
    if (existing) {
      existing.taxableAmount += taxable;
      existing.taxAmount += tax;
    } else {
      map.set(inv.gstPercent, { rate: inv.gstPercent, taxableAmount: taxable, taxAmount: tax });
    }
  }
  return [...map.values()].sort((a, b) => a.rate - b.rate);
}

export function computePurchasesByRate(orders: PurchaseOrder[]): TaxRateRow[] {
  const map = new Map<number, TaxRateRow>();
  for (const po of orders) {
    const existing = map.get(po.tax);
    const taxable = poSubtotal(po);
    const tax = poTotal(po) - taxable;
    if (existing) {
      existing.taxableAmount += taxable;
      existing.taxAmount += tax;
    } else {
      map.set(po.tax, { rate: po.tax, taxableAmount: taxable, taxAmount: tax });
    }
  }
  return [...map.values()].sort((a, b) => a.rate - b.rate);
}

export interface GstInvoiceRow {
  invoiceNumber: string;
  customerName: string;
  date: string;
  taxableAmount: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
}

export function computeGstByInvoice(invoices: Invoice[]): GstInvoiceRow[] {
  return billableInvoices(invoices)
    .map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      date: inv.createdDate,
      taxableAmount: taxableAmount(inv),
      gstPercent: inv.gstPercent,
      gstAmount: invoiceGstAmount(inv),
      total: taxableAmount(inv) + invoiceGstAmount(inv),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export interface TaxByGroupRow {
  name: string;
  taxableAmount: number;
  taxAmount: number;
}

export function computeTaxByProduct(invoices: Invoice[]): TaxByGroupRow[] {
  const map = new Map<string, TaxByGroupRow>();
  for (const inv of billableInvoices(invoices)) {
    const subtotal = invoiceSubtotal(inv);
    const gstAmount = invoiceGstAmount(inv);
    if (subtotal <= 0) continue;
    for (const item of inv.items) {
      const itemRevenue = item.quantity * item.rate;
      const share = itemRevenue / subtotal;
      const itemTaxable = itemRevenue - inv.discountAmount * share;
      const itemTax = gstAmount * share;
      const existing = map.get(item.product);
      if (existing) {
        existing.taxableAmount += itemTaxable;
        existing.taxAmount += itemTax;
      } else {
        map.set(item.product, { name: item.product, taxableAmount: itemTaxable, taxAmount: itemTax });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.taxAmount - a.taxAmount);
}

export function computeTaxByCategory(invoices: Invoice[], products: Product[], categories: Category[]): TaxByGroupRow[] {
  const productRows = computeTaxByProduct(invoices);
  const categoryByProductName = new Map<string, string>();
  for (const p of products) {
    const categoryName = categories.find((c) => c.id === p.categoryId)?.name ?? "Other";
    categoryByProductName.set(p.name.toLowerCase(), categoryName);
  }
  const map = new Map<string, TaxByGroupRow>();
  for (const row of productRows) {
    const categoryName = categoryByProductName.get(row.name.toLowerCase()) ?? "Other";
    const existing = map.get(categoryName);
    if (existing) {
      existing.taxableAmount += row.taxableAmount;
      existing.taxAmount += row.taxAmount;
    } else {
      map.set(categoryName, { name: categoryName, taxableAmount: row.taxableAmount, taxAmount: row.taxAmount });
    }
  }
  return [...map.values()].sort((a, b) => b.taxAmount - a.taxAmount);
}
