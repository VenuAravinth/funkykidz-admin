import type { Expense, FinancePaymentMethod } from "@/types/finance";

export interface ExpenseReportSummary {
  totalExpenses: number;
  thisMonth: number;
  largestCategory: string;
  pendingExpenses: number;
}

export function computeExpenseSummary(expenses: Expense[]): ExpenseReportSummary {
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const byCategory = computeExpenseByCategory(expenses);
  return {
    totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    thisMonth: expenses.filter((e) => e.date.startsWith(monthPrefix)).reduce((sum, e) => sum + e.amount, 0),
    largestCategory: byCategory[0]?.category ?? "—",
    pendingExpenses: expenses.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.amount, 0),
  };
}

export interface ExpenseByDateRow {
  date: string;
  amount: number;
}

export function computeExpenseByDay(expenses: Expense[]): ExpenseByDateRow[] {
  const map = new Map<string, number>();
  for (const e of expenses) map.set(e.date, (map.get(e.date) ?? 0) + e.amount);
  return [...map.entries()].map(([date, amount]) => ({ date, amount })).sort((a, b) => b.date.localeCompare(a.date));
}

export function computeExpenseByMonth(expenses: Expense[]): ExpenseByDateRow[] {
  const map = new Map<string, number>();
  for (const e of expenses) {
    const month = e.date.slice(0, 7);
    map.set(month, (map.get(month) ?? 0) + e.amount);
  }
  return [...map.entries()].map(([date, amount]) => ({ date, amount })).sort((a, b) => b.date.localeCompare(a.date));
}

export interface ExpenseByCategoryRow {
  category: string;
  amount: number;
}

export function computeExpenseByCategory(expenses: Expense[]): ExpenseByCategoryRow[] {
  const map = new Map<string, number>();
  for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  return [...map.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

export interface ExpenseByMethodRow {
  method: FinancePaymentMethod;
  amount: number;
  count: number;
}

export function computeExpenseByMethod(expenses: Expense[]): ExpenseByMethodRow[] {
  const map = new Map<string, ExpenseByMethodRow>();
  for (const e of expenses) {
    const existing = map.get(e.method);
    if (existing) {
      existing.amount += e.amount;
      existing.count += 1;
    } else {
      map.set(e.method, { method: e.method, amount: e.amount, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

export function computeRecurringExpenses(expenses: Expense[]): Expense[] {
  return expenses.filter((e) => e.recurring).sort((a, b) => b.amount - a.amount);
}
