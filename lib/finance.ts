import type { Invoice } from "@/types/invoice";
import type { Expense, IncomeEntry } from "@/types/finance";
import { invoiceGrandTotal, invoiceBalance } from "@/lib/dummy-data/invoices";
import { addDays } from "@/lib/format";
import { suppliers, supplierPayments } from "@/lib/dummy-data/suppliers";
import type { SupplierPayment } from "@/types/supplier";

const NOT_OUTSTANDING_INVOICE_STATUSES = new Set(["draft", "cancelled", "refunded"]);

export type AgingStatus = "due" | "overdue";

export interface ReceivableRow {
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  total: number;
  paid: number;
  outstanding: number;
  dueDate: string;
  status: AgingStatus;
}

const DUE_DAYS = 15;

export function getReceivablesRows(invoices: Invoice[], today = new Date().toISOString().slice(0, 10)): ReceivableRow[] {
  return invoices
    .filter((inv) => !NOT_OUTSTANDING_INVOICE_STATUSES.has(inv.status) && invoiceBalance(inv) > 0)
    .map((inv) => {
      const dueDate = addDays(inv.createdDate, DUE_DAYS);
      return {
        customerName: inv.customerName,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        total: invoiceGrandTotal(inv),
        paid: inv.paidAmount,
        outstanding: invoiceBalance(inv),
        dueDate,
        status: dueDate < today ? "overdue" : "due",
      } satisfies ReceivableRow;
    })
    .sort((a, b) => b.outstanding - a.outstanding);
}

export interface ReceivablesDashboardStats {
  totalOutstanding: number;
  dueToday: number;
  overdue: number;
}

export function getReceivablesDashboardStats(invoices: Invoice[], today = new Date().toISOString().slice(0, 10)): ReceivablesDashboardStats {
  const rows = getReceivablesRows(invoices, today);
  return {
    totalOutstanding: rows.reduce((sum, r) => sum + r.outstanding, 0),
    dueToday: rows.filter((r) => r.dueDate === today).reduce((sum, r) => sum + r.outstanding, 0),
    overdue: rows.filter((r) => r.status === "overdue").reduce((sum, r) => sum + r.outstanding, 0),
  };
}

export interface PayableRow {
  supplierId: string;
  supplierName: string;
  paymentId: string;
  invoiceNumber: string;
  amount: number;
  paid: number;
  outstanding: number;
  dueDate: string;
  status: AgingStatus;
}

export function getPayablesRows(payments: SupplierPayment[] = supplierPayments, today = new Date().toISOString().slice(0, 10)): PayableRow[] {
  return payments
    .filter((p) => p.amount - p.paidAmount > 0)
    .map((p) => ({
      supplierId: p.supplierId,
      supplierName: p.supplierName,
      paymentId: p.id,
      invoiceNumber: p.invoiceNumber,
      amount: p.amount,
      paid: p.paidAmount,
      outstanding: p.amount - p.paidAmount,
      dueDate: p.dueDate,
      status: p.dueDate < today ? "overdue" : "due",
    }) satisfies PayableRow)
    .sort((a, b) => b.outstanding - a.outstanding);
}

export interface PayablesDashboardStats {
  totalPayable: number;
  dueToday: number;
  overdue: number;
}

export function getPayablesDashboardStats(payments: SupplierPayment[] = supplierPayments, today = new Date().toISOString().slice(0, 10)): PayablesDashboardStats {
  const rows = getPayablesRows(payments, today);
  return {
    totalPayable: rows.reduce((sum, r) => sum + r.outstanding, 0),
    dueToday: rows.filter((r) => r.dueDate === today).reduce((sum, r) => sum + r.outstanding, 0),
    overdue: rows.filter((r) => r.status === "overdue").reduce((sum, r) => sum + r.outstanding, 0),
  };
}

export function getSupplierOutstanding(supplierId: string): number {
  return suppliers.find((s) => s.id === supplierId)?.outstandingAmount ?? 0;
}

export interface ProfitAndLossCategoryRow {
  category: string;
  amount: number;
}

export interface ProfitAndLoss {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeByCategory: ProfitAndLossCategoryRow[];
  expenseByCategory: ProfitAndLossCategoryRow[];
}

export function getProfitAndLoss(income: IncomeEntry[], expenseList: Expense[]): ProfitAndLoss {
  const received = income.filter((i) => i.status === "received");
  const paid = expenseList.filter((e) => e.status === "paid");

  const totalIncome = received.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = paid.reduce((sum, e) => sum + e.amount, 0);

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    incomeByCategory: groupSum(received.map((i) => ({ category: i.category as string, amount: i.amount }))),
    expenseByCategory: groupSum(paid.map((e) => ({ category: e.category as string, amount: e.amount }))),
  };
}

function groupSum(rows: Array<{ category: string; amount: number }>): ProfitAndLossCategoryRow[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.category, (map.get(row.category) ?? 0) + row.amount);
  }
  return [...map.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}
