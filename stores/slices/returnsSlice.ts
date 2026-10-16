import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { salesReturns } from "@/lib/dummy-data/returns";
import type { InspectionResult, RefundMethod, ReturnReason, ReturnStatus, SalesReturn } from "@/types/return";

export interface ReturnsState {
  returns: SalesReturn[];
}

const initialState: ReturnsState = {
  returns: salesReturns,
};

function nextId(): string {
  return `ret_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

function nextReturnNumber(existing: SalesReturn[]): string {
  const highest = existing.reduce((max, r) => {
    const n = Number(r.returnNumber.replace("RET-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 100);
  return `RET-${highest + 1}`;
}

export interface NewReturnInput {
  invoiceId?: string;
  invoiceNumber: string;
  customerName: string;
  productId: string;
  variantId?: string;
  barcode: string;
  product: string;
  quantity: number;
  amount: number;
  reason: ReturnReason;
  notes?: string;
}

const returnsSlice = createSlice({
  name: "returns",
  initialState,
  reducers: {
    addReturn: {
      prepare: (input: NewReturnInput) => ({
        payload: {
          id: nextId(),
          returnNumber: "",
          status: "pending" as ReturnStatus,
          createdDate: new Date().toISOString().slice(0, 10),
          ...input,
        } as SalesReturn,
      }),
      reducer: (state, action: PayloadAction<SalesReturn>) => {
        const salesReturn = { ...action.payload, returnNumber: nextReturnNumber(state.returns) };
        state.returns.unshift(salesReturn);
      },
    },
    setReturnInspection: (state, action: PayloadAction<{ id: string; result: InspectionResult }>) => {
      const salesReturn = state.returns.find((r) => r.id === action.payload.id);
      if (salesReturn) {
        salesReturn.status = "approved";
        salesReturn.inspectionResult = action.payload.result;
      }
    },
    rejectReturn: (state, action: PayloadAction<{ id: string }>) => {
      const salesReturn = state.returns.find((r) => r.id === action.payload.id);
      if (salesReturn) salesReturn.status = "rejected";
    },
    issueRefund: (state, action: PayloadAction<{ id: string; method: RefundMethod }>) => {
      const salesReturn = state.returns.find((r) => r.id === action.payload.id);
      if (salesReturn) {
        salesReturn.status = "refunded";
        salesReturn.refundMethod = action.payload.method;
      }
    },
  },
});

export const { addReturn, setReturnInspection, rejectReturn, issueRefund } = returnsSlice.actions;

interface RootStateWithReturns {
  returns: ReturnsState;
}

export const selectReturns = (state: RootStateWithReturns) => state.returns.returns;
export const selectReturnById = (id: string) => (state: RootStateWithReturns) => state.returns.returns.find((r) => r.id === id);

export default returnsSlice.reducer;
