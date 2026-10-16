import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { customerPayments } from "@/lib/dummy-data/payments";
import type { CustomerPayment, PaymentMethod, PaymentSplitEntry, PaymentType } from "@/types/payment";

export interface CustomerPaymentsState {
  payments: CustomerPayment[];
}

const initialState: CustomerPaymentsState = {
  payments: customerPayments,
};

function nextId(): string {
  return `pay_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

function nextPaymentNumber(existing: CustomerPayment[]): string {
  const highest = existing.reduce((max, p) => {
    const n = Number(p.paymentNumber.replace("PAY-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 2000);
  return `PAY-${highest + 1}`;
}

export interface NewPaymentInput {
  invoiceId?: string;
  invoiceNumber: string;
  customerName: string;
  method: PaymentMethod | "Split";
  splitBreakdown?: PaymentSplitEntry[];
  amount: number;
  type: PaymentType;
  notes?: string;
}

const customerPaymentsSlice = createSlice({
  name: "customerPayments",
  initialState,
  reducers: {
    addPayment: {
      prepare: (input: NewPaymentInput) => ({
        payload: {
          id: nextId(),
          paymentNumber: "",
          status: (input.type === "credit" ? "pending" : "paid") as CustomerPayment["status"],
          date: new Date().toISOString().slice(0, 10),
          ...input,
        } as CustomerPayment,
      }),
      reducer: (state, action: PayloadAction<CustomerPayment>) => {
        const payment = { ...action.payload, paymentNumber: nextPaymentNumber(state.payments) };
        state.payments.unshift(payment);
      },
    },
    refundPayment: (state, action: PayloadAction<{ id: string }>) => {
      const payment = state.payments.find((p) => p.id === action.payload.id);
      if (payment) payment.status = "refunded";
    },
    reversePayment: (state, action: PayloadAction<{ id: string }>) => {
      const payment = state.payments.find((p) => p.id === action.payload.id);
      if (payment) payment.status = "reversed";
    },
  },
});

export const { addPayment, refundPayment, reversePayment } = customerPaymentsSlice.actions;

interface RootStateWithCustomerPayments {
  customerPayments: CustomerPaymentsState;
}

export const selectCustomerPayments = (state: RootStateWithCustomerPayments) => state.customerPayments.payments;
export const selectCustomerPaymentById = (id: string) => (state: RootStateWithCustomerPayments) =>
  state.customerPayments.payments.find((p) => p.id === id);

export default customerPaymentsSlice.reducer;
