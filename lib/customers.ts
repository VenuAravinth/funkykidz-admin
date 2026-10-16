import type { Invoice } from "@/types/invoice";
import type { CustomerPayment } from "@/types/payment";
import type { Customer } from "@/types/customer";
import { invoiceGrandTotal, invoiceBalance } from "@/lib/dummy-data/invoices";
import { customerCreditLimits, DEFAULT_CREDIT_LIMIT } from "@/lib/dummy-data/finance";

export interface CustomerSummary {
  name: string;
  phone: string;
  totalOrders: number;
  totalPurchases: number;
  outstanding: number;
  lastPurchaseDate?: string;
}

const EXCLUDED_STATUSES = new Set(["draft", "cancelled"]);

export function buildCustomerSummaries(invoices: Invoice[]): CustomerSummary[] {
  const byName = new Map<string, CustomerSummary>();
  for (const inv of invoices) {
    if (EXCLUDED_STATUSES.has(inv.status)) continue;
    const total = invoiceGrandTotal(inv);
    const balance = invoiceBalance(inv);
    const existing = byName.get(inv.customerName);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalPurchases += total;
      existing.outstanding += balance;
      if (!existing.phone && inv.customerPhone) existing.phone = inv.customerPhone;
      if (!existing.lastPurchaseDate || inv.createdDate > existing.lastPurchaseDate) existing.lastPurchaseDate = inv.createdDate;
    } else {
      byName.set(inv.customerName, {
        name: inv.customerName,
        phone: inv.customerPhone || "—",
        totalOrders: 1,
        totalPurchases: total,
        outstanding: balance,
        lastPurchaseDate: inv.createdDate,
      });
    }
  }
  return [...byName.values()].sort((a, b) => b.totalPurchases - a.totalPurchases);
}

export function getCustomerSummary(invoices: Invoice[], name: string): CustomerSummary | undefined {
  return buildCustomerSummaries(invoices).find((c) => c.name === name);
}

export function resolveCustomerCreditLimit(customer: Customer | undefined, name: string): number {
  if (customer?.allowCredit) return customer.creditLimit;
  return customerCreditLimits[name] ?? DEFAULT_CREDIT_LIMIT;
}

export interface CustomerLedgerEntry {
  date: string;
  type: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export function buildCustomerLedger(invoices: Invoice[], payments: CustomerPayment[], name: string): CustomerLedgerEntry[] {
  const rows = invoices
    .filter((i) => i.customerName === name && !EXCLUDED_STATUSES.has(i.status))
    .map((i) => ({ date: i.createdDate, type: "Invoice", description: `${i.invoiceNumber} raised`, debit: invoiceGrandTotal(i), credit: 0 }))
    .concat(
      payments
        .filter((p) => p.customerName === name && p.status === "paid")
        .map((p) => ({ date: p.date, type: "Payment", description: `${p.paymentNumber} received via ${p.method}`, debit: 0, credit: p.amount })),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  let balance = 0;
  return rows.map((row) => {
    balance += row.debit - row.credit;
    return { ...row, balance };
  });
}
