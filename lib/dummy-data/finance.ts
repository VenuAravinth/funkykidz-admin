import type { BankAccount, Expense, IncomeEntry } from "@/types/finance";

export const bankAccounts: BankAccount[] = [
  {
    id: "bank_1",
    name: "HDFC Bank — Current A/c",
    bankName: "HDFC Bank",
    accountNumber: "XXXX XXXX 4471",
    ifsc: "HDFC0001234",
    type: "current",
    openingBalance: 400_000,
    balance: 275_750,
  },
  {
    id: "bank_2",
    name: "ICICI Bank — Savings",
    bankName: "ICICI Bank",
    accountNumber: "XXXX XXXX 9082",
    ifsc: "ICIC0005678",
    type: "savings",
    openingBalance: 50_000,
    balance: 50_000,
  },
];

export const DEFAULT_CREDIT_LIMIT = 10_000;
export const customerCreditLimits: Record<string, number> = {
  Venu: 10_000,
  Priya: 15_000,
  "Rainbow Kids Store": 20_000,
  "Bubblegum Fashion": 15_000,
  "Sunny Days Kids": 10_000,
  "Cherub Kidswear": 12_000,
  "Aditi Rao": 10_000,
};

export const incomeEntries: IncomeEntry[] = [
  { id: "inc_1", date: "2026-08-27", reference: "INV-1052", source: "Venu", category: "Product Sales", method: "UPI", amount: 2_500, status: "received" },
  { id: "inc_2", date: "2026-08-27", reference: "INV-1053", source: "Priya", category: "Product Sales", method: "Cash", amount: 1_800, status: "received" },
  { id: "inc_3", date: "2026-08-26", reference: "INC-012", source: "Other Income", category: "Other Income", method: "Bank", amount: 5_000, status: "received" },
  { id: "inc_4", date: "2026-08-25", reference: "INV-1050", source: "Rainbow Kids Store", category: "Product Sales", method: "Bank", amount: 145_000, status: "received" },
  { id: "inc_5", date: "2026-08-24", reference: "ORD-3381", source: "Online Store", category: "Online Sales", method: "UPI", amount: 178_000, status: "received" },
  { id: "inc_6", date: "2026-08-23", reference: "PAY-2004", source: "Sunny Days Kids", category: "Customer Payment", method: "Cash", amount: 118_200, status: "received" },
  { id: "inc_7", date: "2026-08-22", reference: "INV-1048", source: "Little Trendz", category: "Product Sales", method: "Cash", amount: 100_000, status: "received" },
  { id: "inc_8", date: "2026-08-21", reference: "INV-1045", source: "Cherub Kidswear", category: "Product Sales", method: "Bank", amount: 234_500, status: "received" },
  { id: "inc_9", date: "2026-08-20", reference: "INC-010", source: "Scrap / Packaging Resale", category: "Other Income", method: "Bank", amount: 40_000, status: "received" },
  { id: "inc_10", date: "2026-08-19", reference: "INV-1044", source: "Bubblegum Fashion", category: "Customer Payment", method: "Bank", amount: 8_000, status: "pending" },
  { id: "inc_11", date: "2026-08-18", reference: "INC-009", source: "Vendor Referral Bonus", category: "Miscellaneous", method: "Cash", amount: 20_000, status: "received" },
];

export const expenses: Expense[] = [
  { id: "exp_1", category: "Electricity", amount: 8_500, date: "2026-08-27", method: "Bank", paidFrom: "bank_1", description: "August electricity bill", status: "paid" },
  { id: "exp_2", category: "Advertising", amount: 12_000, date: "2026-08-24", method: "Bank", paidFrom: "bank_1", description: "Instagram ads campaign", status: "pending" },
  { id: "exp_3", category: "Bank Charges", amount: 450, date: "2026-08-18", method: "Bank", paidFrom: "bank_1", description: "NEFT charges", status: "paid" },
  { id: "exp_4", category: "Shop Rent", amount: 45_000, date: "2026-08-20", method: "Bank", paidFrom: "bank_1", description: "August shop rent", status: "paid", recurring: true },
  { id: "exp_5", category: "Staff Salary", amount: 62_000, date: "2026-08-15", method: "Bank", paidFrom: "bank_1", description: "Staff salaries — first half of August", status: "paid", recurring: true },
  { id: "exp_6", category: "Software / Subscription", amount: 6_500, date: "2026-08-12", method: "Bank", paidFrom: "bank_1", description: "POS + accounting software renewal", status: "paid", recurring: true },
  { id: "exp_7", category: "Internet", amount: 1_800, date: "2026-08-10", method: "Bank", paidFrom: "bank_1", description: "Internet bill", status: "paid", recurring: true },
  { id: "exp_8", category: "Transport", amount: 4_200, date: "2026-08-08", method: "Cash", paidFrom: "Cash", description: "Delivery van fuel", status: "paid" },
  { id: "exp_9", category: "Packaging", amount: 8_500, date: "2026-08-05", method: "Cash", paidFrom: "Cash", description: "Poly mailers restock", status: "paid" },
  { id: "exp_10", category: "Delivery Charges", amount: 3_200, date: "2026-07-28", method: "Cash", paidFrom: "Cash", description: "Courier charges — July", status: "paid" },
];

export interface IncomeDashboardStats {
  totalIncome: number;
  salesIncome: number;
  otherIncome: number;
  cashReceived: number;
  bankUpiReceived: number;
}

const SALES_INCOME_CATEGORIES = new Set(["Product Sales", "Online Sales", "Customer Payment"]);

export function getIncomeDashboardStats(income: IncomeEntry[]): IncomeDashboardStats {
  const received = income.filter((i) => i.status === "received");
  const totalIncome = received.reduce((sum, i) => sum + i.amount, 0);
  const salesIncome = received.filter((i) => SALES_INCOME_CATEGORIES.has(i.category)).reduce((sum, i) => sum + i.amount, 0);
  return {
    totalIncome,
    salesIncome,
    otherIncome: totalIncome - salesIncome,
    cashReceived: received.filter((i) => i.method === "Cash").reduce((sum, i) => sum + i.amount, 0),
    bankUpiReceived: received.filter((i) => i.method === "Bank" || i.method === "UPI").reduce((sum, i) => sum + i.amount, 0),
  };
}

export interface ExpenseDashboardStats {
  todayExpenses: number;
  thisMonth: number;
  pendingExpenses: number;
  recurringExpenses: number;
}

export function getExpenseDashboardStats(expenseList: Expense[]): ExpenseDashboardStats {
  const today = new Date().toISOString().slice(0, 10);
  const monthPrefix = today.slice(0, 7);
  return {
    todayExpenses: expenseList.filter((e) => e.date === today).reduce((sum, e) => sum + e.amount, 0),
    thisMonth: expenseList.filter((e) => e.date.startsWith(monthPrefix)).reduce((sum, e) => sum + e.amount, 0),
    pendingExpenses: expenseList.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.amount, 0),
    recurringExpenses: expenseList.filter((e) => e.recurring).reduce((sum, e) => sum + e.amount, 0),
  };
}
