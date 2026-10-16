import type { Invoice } from "@/types/invoice";
import type { Product, Category } from "@/types/product";
import type { CustomerPayment } from "@/types/payment";
import type { SalesReturn } from "@/types/return";
import { invoiceSubtotal, invoiceGstAmount, invoiceGrandTotal } from "@/lib/dummy-data/invoices";
import { buildCustomerSummaries, type CustomerSummary } from "@/lib/customers";
import { PAYMENT_METHODS } from "@/types/payment";

export type DateRangePreset = "today" | "yesterday" | "week" | "month" | "custom";

export interface DateRange {
  from: string;
  to: string;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function resolveDateRange(preset: DateRangePreset, customFrom?: string, customTo?: string): DateRange {
  const now = new Date();
  const todayIso = toIso(now);
  if (preset === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const iso = toIso(y);
    return { from: iso, to: iso };
  }
  if (preset === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    return { from: toIso(start), to: todayIso };
  }
  if (preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toIso(start), to: todayIso };
  }
  if (preset === "custom") {
    return { from: customFrom || todayIso, to: customTo || todayIso };
  }
  return { from: todayIso, to: todayIso };
}

export function isInRange(dateIso: string, range: DateRange): boolean {
  return dateIso >= range.from && dateIso <= range.to;
}

const SALES_EXCLUDED_STATUSES = new Set(["draft", "cancelled", "refunded"]);

function billableInvoices(invoices: Invoice[]): Invoice[] {
  return invoices.filter((i) => !SALES_EXCLUDED_STATUSES.has(i.status));
}

function findCatalogProduct(products: Product[], name: string): Product | undefined {
  return products.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

export interface SalesReportData {
  totalSales: number;
  invoiceCount: number;
  itemsSold: number;
  averageOrderValue: number;
  grossSales: number;
  discounts: number;
  tax: number;
  netSales: number;
}

export function computeSalesReport(invoices: Invoice[]): SalesReportData {
  const rows = billableInvoices(invoices);
  const totalSales = rows.reduce((sum, i) => sum + invoiceGrandTotal(i), 0);
  const grossSales = rows.reduce((sum, i) => sum + invoiceSubtotal(i), 0);
  const discounts = rows.reduce((sum, i) => sum + i.discountAmount, 0);
  const tax = rows.reduce((sum, i) => sum + invoiceGstAmount(i), 0);
  const itemsSold = rows.reduce((sum, i) => sum + i.items.reduce((a, it) => a + it.quantity, 0), 0);
  const invoiceCount = rows.length;
  return {
    totalSales,
    invoiceCount,
    itemsSold,
    averageOrderValue: invoiceCount > 0 ? totalSales / invoiceCount : 0,
    grossSales,
    discounts,
    tax,
    netSales: grossSales - discounts,
  };
}

export interface ProductSalesRow {
  product: string;
  unitsSold: number;
  revenue: number;
  cost: number | null;
  profit: number | null;
  marginPercent: number | null;
}

export function computeProductSales(invoices: Invoice[], products: Product[]): ProductSalesRow[] {
  const map = new Map<string, ProductSalesRow>();
  for (const inv of billableInvoices(invoices)) {
    for (const item of inv.items) {
      const catalogProduct = findCatalogProduct(products, item.product);
      const revenue = item.quantity * item.rate;
      const cost = catalogProduct ? catalogProduct.costPrice * item.quantity : null;
      const existing = map.get(item.product);
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue += revenue;
        existing.cost = existing.cost !== null && cost !== null ? existing.cost + cost : null;
      } else {
        map.set(item.product, { product: item.product, unitsSold: item.quantity, revenue, cost, profit: null, marginPercent: null });
      }
    }
  }
  return [...map.values()]
    .map((row) => {
      const profit = row.cost !== null ? row.revenue - row.cost : null;
      const marginPercent = profit !== null && row.revenue > 0 ? (profit / row.revenue) * 100 : null;
      return { ...row, profit, marginPercent };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export interface CategorySalesRow {
  category: string;
  amount: number;
}

export function computeCategorySales(invoices: Invoice[], products: Product[], categories: Category[]): CategorySalesRow[] {
  const map = new Map<string, number>();
  for (const inv of billableInvoices(invoices)) {
    for (const item of inv.items) {
      const catalogProduct = findCatalogProduct(products, item.product);
      const categoryName = catalogProduct ? (categories.find((c) => c.id === catalogProduct.categoryId)?.name ?? "Other") : "Other";
      map.set(categoryName, (map.get(categoryName) ?? 0) + item.quantity * item.rate);
    }
  }
  return [...map.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

export interface PaymentReportRow {
  method: string;
  amount: number;
  count: number;
}

export function computePaymentReport(payments: CustomerPayment[]): PaymentReportRow[] {
  const map = new Map<string, PaymentReportRow>();
  const add = (method: string, amount: number) => {
    const existing = map.get(method);
    if (existing) {
      existing.amount += amount;
      existing.count += 1;
    } else {
      map.set(method, { method, amount, count: 1 });
    }
  };
  for (const p of payments.filter((p) => p.status === "paid")) {
    if (p.method === "Split" && p.splitBreakdown) {
      for (const s of p.splitBreakdown) add(s.method, s.amount);
    } else {
      add(p.method, p.amount);
    }
  }
  for (const m of [...PAYMENT_METHODS, "Bank Transfer"]) {
    if (!map.has(m)) map.set(m, { method: m, amount: 0, count: 0 });
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

export interface SalespersonReportRow {
  salesperson: string;
  orders: number;
  sales: number;
  discounts: number;
  returns: number;
  profit: number;
}

export function computeSalespersonReport(invoices: Invoice[], returns: SalesReturn[], products: Product[]): SalespersonReportRow[] {
  const map = new Map<string, SalespersonReportRow>();
  for (const inv of billableInvoices(invoices)) {
    if (!inv.salesperson) continue;
    const sales = invoiceGrandTotal(inv);
    const cost = inv.items.reduce((sum, item) => {
      const cp = findCatalogProduct(products, item.product);
      return sum + (cp ? cp.costPrice * item.quantity : 0);
    }, 0);
    const existing = map.get(inv.salesperson);
    if (existing) {
      existing.orders += 1;
      existing.sales += sales;
      existing.discounts += inv.discountAmount;
      existing.profit += sales - cost;
    } else {
      map.set(inv.salesperson, { salesperson: inv.salesperson, orders: 1, sales, discounts: inv.discountAmount, returns: 0, profit: sales - cost });
    }
  }
  const invoiceById = new Map(invoices.map((i) => [i.id, i]));
  for (const ret of returns) {
    if (ret.status !== "approved" && ret.status !== "refunded") continue;
    const linkedInvoice = ret.invoiceId ? invoiceById.get(ret.invoiceId) : undefined;
    if (linkedInvoice?.salesperson && map.has(linkedInvoice.salesperson)) {
      map.get(linkedInvoice.salesperson)!.returns += ret.amount;
    }
  }
  return [...map.values()].sort((a, b) => b.sales - a.sales);
}

export interface CustomerSalesReportData {
  topCustomers: CustomerSummary[];
  newCustomersCount: number;
  repeatCustomersCount: number;
  averageCustomerSpend: number;
}

export function computeCustomerSalesReport(allInvoices: Invoice[], rangeInvoices: Invoice[]): CustomerSalesReportData {
  const validAll = billableInvoices(allInvoices);
  const validRange = billableInvoices(rangeInvoices);
  const rangeCustomers = new Set(validRange.map((i) => i.customerName));
  let newCustomersCount = 0;
  let repeatCustomersCount = 0;
  for (const name of rangeCustomers) {
    const lifetimeOrders = validAll.filter((i) => i.customerName === name).length;
    if (lifetimeOrders <= 1) newCustomersCount += 1;
    else repeatCustomersCount += 1;
  }
  const totalSpendInRange = validRange.reduce((sum, i) => sum + invoiceGrandTotal(i), 0);
  return {
    topCustomers: buildCustomerSummaries(validRange),
    newCustomersCount,
    repeatCustomersCount,
    averageCustomerSpend: rangeCustomers.size > 0 ? totalSpendInRange / rangeCustomers.size : 0,
  };
}

export interface ReturnReportData {
  totalReturns: number;
  returnAmount: number;
  returnRatePercent: number;
  topReturnedProducts: { product: string; quantity: number; amount: number }[];
  reasonBreakdown: { reason: string; count: number }[];
}

export function computeReturnReport(returns: SalesReturn[], totalSales: number): ReturnReportData {
  const realized = returns.filter((r) => r.status === "approved" || r.status === "refunded");
  const returnAmount = realized.reduce((sum, r) => sum + r.amount, 0);
  const productMap = new Map<string, { product: string; quantity: number; amount: number }>();
  for (const r of realized) {
    const existing = productMap.get(r.product);
    if (existing) {
      existing.quantity += r.quantity;
      existing.amount += r.amount;
    } else {
      productMap.set(r.product, { product: r.product, quantity: r.quantity, amount: r.amount });
    }
  }
  const reasonMap = new Map<string, number>();
  for (const r of returns) reasonMap.set(r.reason, (reasonMap.get(r.reason) ?? 0) + 1);
  return {
    totalReturns: returns.length,
    returnAmount,
    returnRatePercent: totalSales > 0 ? (returnAmount / totalSales) * 100 : 0,
    topReturnedProducts: [...productMap.values()].sort((a, b) => b.amount - a.amount),
    reasonBreakdown: [...reasonMap.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
  };
}

export interface ProfitReportData {
  salesRevenue: number;
  costOfGoods: number;
  grossProfit: number;
  grossMarginPercent: number;
}

export function computeProfitReport(invoices: Invoice[], products: Product[]): ProfitReportData {
  const rows = billableInvoices(invoices);
  const salesRevenue = rows.reduce((sum, i) => sum + invoiceGrandTotal(i), 0);
  const costOfGoods = rows.reduce(
    (sum, i) =>
      sum +
      i.items.reduce((a, item) => {
        const cp = findCatalogProduct(products, item.product);
        return a + (cp ? cp.costPrice * item.quantity : 0);
      }, 0),
    0,
  );
  const grossProfit = salesRevenue - costOfGoods;
  return { salesRevenue, costOfGoods, grossProfit, grossMarginPercent: salesRevenue > 0 ? (grossProfit / salesRevenue) * 100 : 0 };
}
