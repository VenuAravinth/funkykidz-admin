import { z } from "zod";
import { EXPENSE_CATEGORIES, FINANCE_PAYMENT_METHODS, INCOME_CATEGORIES } from "@/types/finance";

export const incomeSchema = z.object({
  category: z.enum(INCOME_CATEGORIES, { error: "Select a category." }),
  source: z.string().trim().min(2, { error: "Enter a source." }).max(120),
  reference: z.string().trim().max(60).optional(),
  amount: z.number({ error: "Amount is required." }).min(1, { error: "Enter an amount." }),
  date: z.string().min(1, { error: "Date is required." }),
  method: z.enum(FINANCE_PAYMENT_METHODS, { error: "Select a method." }),
  status: z.enum(["received", "pending"]),
});
export type IncomeInput = z.infer<typeof incomeSchema>;

export const expenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, { error: "Select a category." }),
  amount: z.number({ error: "Amount is required." }).min(1, { error: "Enter an amount." }),
  date: z.string().min(1, { error: "Date is required." }),
  method: z.enum(FINANCE_PAYMENT_METHODS, { error: "Select a payment method." }),
  paidFrom: z.string().min(1, { error: "Select where this was paid from." }),
  description: z.string().trim().max(500).optional(),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const bankAccountSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter an account name." }).max(120),
  bankName: z.string().trim().min(2, { error: "Enter the bank name." }).max(120),
  accountNumber: z.string().trim().min(4, { error: "Enter the account number." }).max(30),
  ifsc: z.string().trim().max(20).optional(),
  type: z.enum(["current", "savings"]),
  openingBalance: z.number({ error: "Opening balance is required." }).min(0),
});
export type BankAccountInput = z.infer<typeof bankAccountSchema>;

export const cashMovementSchema = z.object({
  direction: z.enum(["deposit", "withdraw"]),
  amount: z.number({ error: "Amount is required." }).min(1, { error: "Enter an amount." }),
  date: z.string().min(1, { error: "Date is required." }),
  bankAccountId: z.string().min(1, { error: "Select a bank account." }),
  notes: z.string().trim().max(500).optional(),
});
export type CashMovementInput = z.infer<typeof cashMovementSchema>;
