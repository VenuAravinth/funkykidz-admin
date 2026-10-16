import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { bankAccounts, expenses, incomeEntries } from "@/lib/dummy-data/finance";
import type { BankAccount, CashMovement, Expense, FinanceTransaction, IncomeEntry } from "@/types/finance";
import type { CustomerPaymentsState } from "./customerPaymentsSlice";

export interface FinanceState {
  income: IncomeEntry[];
  expenses: Expense[];
  bankAccounts: BankAccount[];
  cashMovements: CashMovement[];
  transactions: FinanceTransaction[];
}

const initialState: FinanceState = {
  income: incomeEntries,
  expenses,
  bankAccounts,
  cashMovements: [],
  transactions: [],
};

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export type NewIncomeInput = Omit<IncomeEntry, "id">;
export type NewExpenseInput = Omit<Expense, "id">;
export type NewBankAccountInput = Omit<BankAccount, "id" | "balance">;
export type NewCashMovementInput = Omit<CashMovement, "id">;

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    addIncome: {
      prepare: (input: NewIncomeInput) => ({ payload: { id: nextId("inc"), ...input } as IncomeEntry }),
      reducer: (state, action: PayloadAction<IncomeEntry>) => {
        const entry = action.payload;
        state.income.unshift(entry);
        state.transactions.unshift({
          id: nextId("txn"),
          date: entry.date,
          type: "income",
          reference: entry.reference || entry.category,
          description: `${entry.category} — ${entry.source}`,
          method: entry.method,
          amount: entry.amount,
          direction: "in",
        });
      },
    },
    addExpense: {
      prepare: (input: NewExpenseInput) => ({ payload: { id: nextId("exp"), ...input } as Expense }),
      reducer: (state, action: PayloadAction<Expense>) => {
        const expense = action.payload;
        state.expenses.unshift(expense);
        state.transactions.unshift({
          id: nextId("txn"),
          date: expense.date,
          type: "expense",
          reference: expense.id,
          description: expense.description ? `${expense.category} — ${expense.description}` : expense.category,
          method: expense.method,
          amount: expense.amount,
          direction: "out",
        });
        const account = state.bankAccounts.find((a) => a.id === expense.paidFrom);
        if (account) account.balance -= expense.amount;
      },
    },
    addBankAccount: {
      prepare: (input: NewBankAccountInput) => ({
        payload: { id: nextId("bank"), balance: input.openingBalance, ...input } as BankAccount,
      }),
      reducer: (state, action: PayloadAction<BankAccount>) => {
        state.bankAccounts.push(action.payload);
      },
    },
    addCashMovement: {
      prepare: (input: NewCashMovementInput) => ({ payload: { id: nextId("cash"), ...input } as CashMovement }),
      reducer: (state, action: PayloadAction<CashMovement>) => {
        const movement = action.payload;
        state.cashMovements.unshift(movement);
        const account = state.bankAccounts.find((a) => a.id === movement.bankAccountId);
        if (account) {
          account.balance += movement.direction === "deposit" ? movement.amount : -movement.amount;
        }
        state.transactions.unshift({
          id: nextId("txn"),
          date: movement.date,
          type: "cash_movement",
          reference: movement.id,
          description:
            movement.direction === "deposit"
              ? `Cash deposited to ${account?.name ?? "bank"}`
              : `Cash withdrawn from ${account?.name ?? "bank"}`,
          method: movement.direction === "deposit" ? "Bank" : "Cash",
          amount: movement.amount,
          direction: movement.direction === "deposit" ? "out" : "in",
        });
      },
    },
  },
});

export const { addIncome, addExpense, addBankAccount, addCashMovement } = financeSlice.actions;

interface RootStateWithFinance {
  finance: FinanceState;
}

export const selectIncome = (state: RootStateWithFinance) => state.finance.income;
export const selectExpenses = (state: RootStateWithFinance) => state.finance.expenses;
export const selectBankAccounts = (state: RootStateWithFinance) => state.finance.bankAccounts;
export const selectCashMovements = (state: RootStateWithFinance) => state.finance.cashMovements;
export const selectFinanceTransactions = (state: RootStateWithFinance) => state.finance.transactions;

export const selectCashBalance = (state: RootStateWithFinance) => {
  const cashIn = state.finance.income.filter((i) => i.status === "received" && i.method === "Cash").reduce((sum, i) => sum + i.amount, 0);
  const cashOut = state.finance.expenses.filter((e) => e.status === "paid" && e.method === "Cash").reduce((sum, e) => sum + e.amount, 0);
  const netDeposited = state.finance.cashMovements.reduce(
    (sum, m) => sum + (m.direction === "deposit" ? m.amount : -m.amount),
    0,
  );
  return cashIn - cashOut - netDeposited;
};

interface RootStateWithLedger extends RootStateWithFinance {
  customerPayments: CustomerPaymentsState;
}

export const selectFinanceLedger = createSelector(
  [(state: RootStateWithLedger) => state.finance.transactions, (state: RootStateWithLedger) => state.customerPayments.payments],
  (transactions, payments): FinanceTransaction[] => {
    const paymentEntries: FinanceTransaction[] = payments
      .filter((p) => p.status === "paid")
      .map((p) => ({
        id: p.id,
        date: p.date,
        type: "receivable_payment",
        reference: p.paymentNumber,
        description: `Payment from ${p.customerName} — ${p.invoiceNumber}`,
        method: p.method,
        amount: p.amount,
        direction: "in",
      }));

    return [...transactions, ...paymentEntries].sort((a, b) => (a.date < b.date ? 1 : -1));
  },
);

export default financeSlice.reducer;
