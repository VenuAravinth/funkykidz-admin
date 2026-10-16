import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { stockAdjustments } from "@/lib/dummy-data/stockAdjustments";
import type { AdjustmentReason, StockAdjustment } from "@/types/stockAdjustment";

export interface StockAdjustmentState {
  adjustments: StockAdjustment[];
}

const initialState: StockAdjustmentState = {
  adjustments: stockAdjustments,
};

function nextId(): string {
  return `sadj_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export interface NewAdjustmentInput {
  productId: string;
  variantId?: string;
  barcode: string;
  productName: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  reason: AdjustmentReason;
  notes: string;
  requestedBy: string;
  requestedAt: string;
  requiresApproval: boolean;
}

const stockAdjustmentsSlice = createSlice({
  name: "stockAdjustments",
  initialState,
  reducers: {
    addAdjustment: {
      prepare: (input: NewAdjustmentInput) => ({
        payload: {
          id: nextId(),
          status: input.requiresApproval ? "pending" : "approved",
          ...input,
        } as StockAdjustment,
      }),
      reducer: (state, action: PayloadAction<StockAdjustment>) => {
        state.adjustments.unshift(action.payload);
      },
    },
    approveAdjustment: (state, action: PayloadAction<{ id: string; approvedBy: string }>) => {
      const adjustment = state.adjustments.find((a) => a.id === action.payload.id);
      if (adjustment && adjustment.status === "pending") {
        adjustment.status = "approved";
        adjustment.approvedBy = action.payload.approvedBy;
        adjustment.approvedAt = new Date().toISOString();
      }
    },
    rejectAdjustment: (state, action: PayloadAction<{ id: string; approvedBy: string }>) => {
      const adjustment = state.adjustments.find((a) => a.id === action.payload.id);
      if (adjustment && adjustment.status === "pending") {
        adjustment.status = "rejected";
        adjustment.approvedBy = action.payload.approvedBy;
        adjustment.approvedAt = new Date().toISOString();
      }
    },
  },
});

export const { addAdjustment, approveAdjustment, rejectAdjustment } = stockAdjustmentsSlice.actions;

interface RootStateWithStockAdjustments {
  stockAdjustments: StockAdjustmentState;
}

export const selectStockAdjustments = (state: RootStateWithStockAdjustments) => state.stockAdjustments.adjustments;

export default stockAdjustmentsSlice.reducer;
