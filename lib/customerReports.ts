import type { Customer, CustomerGroup } from "@/types/customer";
import type { Invoice } from "@/types/invoice";
import type { SalesReturn } from "@/types/return";
import { buildCustomerSummaries, type CustomerSummary } from "@/lib/customers";

export interface CustomerReportSummary {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  creditCustomers: number;
  outstanding: number;
}

export function computeCustomerReportSummary(customers: Customer[], invoices: Invoice[], days = 30): CustomerReportSummary {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  const summaries = buildCustomerSummaries(invoices);
  const outstandingByName = new Map(summaries.map((s) => [s.name, s.outstanding]));

  return {
    totalCustomers: customers.length,
    newCustomers: customers.filter((c) => c.createdDate >= cutoffIso).length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    creditCustomers: customers.filter((c) => c.allowCredit).length,
    outstanding: customers.filter((c) => c.allowCredit).reduce((sum, c) => sum + (outstandingByName.get(c.name) ?? 0), 0),
  };
}

export interface NewCustomerTrendRow {
  date: string;
  count: number;
}

export function computeNewCustomerTrend(customers: Customer[], monthly = false): NewCustomerTrendRow[] {
  const map = new Map<string, number>();
  for (const c of customers) {
    const key = monthly ? c.createdDate.slice(0, 7) : c.createdDate;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => b.date.localeCompare(a.date));
}

export interface RepeatCustomerBuckets {
  onePurchase: number;
  twoToFive: number;
  sixPlus: number;
}

export function computeRepeatCustomerBuckets(summaries: CustomerSummary[]): RepeatCustomerBuckets {
  return summaries.reduce(
    (acc, s) => {
      if (s.totalOrders <= 1) acc.onePurchase += 1;
      else if (s.totalOrders <= 5) acc.twoToFive += 1;
      else acc.sixPlus += 1;
      return acc;
    },
    { onePurchase: 0, twoToFive: 0, sixPlus: 0 },
  );
}

export interface CustomerCreditRow {
  name: string;
  creditLimit: number;
  outstanding: number;
  usedPercent: number;
  paymentTerms: string;
}

export function computeCustomerCredit(customers: Customer[], invoices: Invoice[]): CustomerCreditRow[] {
  const summaries = buildCustomerSummaries(invoices);
  const outstandingByName = new Map(summaries.map((s) => [s.name, s.outstanding]));
  return customers
    .filter((c) => c.allowCredit)
    .map((c) => {
      const outstanding = outstandingByName.get(c.name) ?? 0;
      return {
        name: c.name,
        creditLimit: c.creditLimit,
        outstanding,
        usedPercent: c.creditLimit > 0 ? Math.min((outstanding / c.creditLimit) * 100, 999) : 0,
        paymentTerms: c.paymentTerms,
      };
    })
    .sort((a, b) => b.outstanding - a.outstanding);
}

export interface CustomerReturnRow {
  customerName: string;
  returnCount: number;
  returnAmount: number;
}

export function computeCustomerReturns(returns: SalesReturn[]): CustomerReturnRow[] {
  const map = new Map<string, CustomerReturnRow>();
  for (const r of returns) {
    const existing = map.get(r.customerName);
    if (existing) {
      existing.returnCount += 1;
      existing.returnAmount += r.amount;
    } else {
      map.set(r.customerName, { customerName: r.customerName, returnCount: 1, returnAmount: r.amount });
    }
  }
  return [...map.values()].sort((a, b) => b.returnAmount - a.returnAmount);
}

export interface CustomerGroupRow {
  groupName: string;
  customerCount: number;
  totalSpent: number;
}

export function computeCustomerGroups(customers: Customer[], groups: CustomerGroup[], invoices: Invoice[]): CustomerGroupRow[] {
  const summaries = buildCustomerSummaries(invoices);
  const spendByName = new Map(summaries.map((s) => [s.name, s.totalPurchases]));
  const groupById = new Map(groups.map((g) => [g.id, g.name]));
  const map = new Map<string, CustomerGroupRow>();
  for (const c of customers) {
    const groupName = groupById.get(c.groupId) ?? "Ungrouped";
    const existing = map.get(groupName);
    const spend = spendByName.get(c.name) ?? 0;
    if (existing) {
      existing.customerCount += 1;
      existing.totalSpent += spend;
    } else {
      map.set(groupName, { groupName, customerCount: 1, totalSpent: spend });
    }
  }
  return [...map.values()].sort((a, b) => b.totalSpent - a.totalSpent);
}
