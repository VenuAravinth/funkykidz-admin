export const FINANCE_PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank"] as const;
export type FinancePaymentMethod = (typeof FINANCE_PAYMENT_METHODS)[number];

export const INCOME_CATEGORIES = [
  "Product Sales",
  "Online Sales",
  "Customer Payment",
  "Other Income",
  "Refund Reversal",
  "Miscellaneous",
] as const;
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export type IncomeStatus = "received" | "pending";

export interface IncomeEntry {
  id: string;
  date: string;
  reference: string;
  source: string;
  category: IncomeCategory;
  method: FinancePaymentMethod;
  amount: number;
  status: IncomeStatus;
}

export const EXPENSE_CATEGORIES = [
  "Shop Rent",
  "Electricity",
  "Internet",
  "Staff Salary",
  "Transport",
  "Packaging",
  "Advertising",
  "Maintenance",
  "Repairs",
  "Purchase-related Expenses",
  "Delivery Charges",
  "Software / Subscription",
  "Bank Charges",
  "Miscellaneous",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type ExpenseStatus = "paid" | "pending";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  method: FinancePaymentMethod;
  paidFrom: string;
  description?: string;
  attachmentName?: string;
  status: ExpenseStatus;
  recurring?: boolean;
}

export type BankAccountType = "current" | "savings";

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  ifsc?: string;
  type: BankAccountType;
  openingBalance: number;
  balance: number;
}

export type CashMovementDirection = "deposit" | "withdraw";

export interface CashMovement {
  id: string;
  date: string;
  direction: CashMovementDirection;
  amount: number;
  bankAccountId: string;
  notes?: string;
}

export type FinanceTransactionType = "income" | "expense" | "receivable_payment" | "payable_payment" | "cash_movement";

export interface FinanceTransaction {
  id: string;
  date: string;
  type: FinanceTransactionType;
  reference: string;
  description: string;
  method: string;
  amount: number;
  direction: "in" | "out";
}
