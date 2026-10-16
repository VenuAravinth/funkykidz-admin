import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { stockMovements } from "@/lib/dummy-data/stockMovements";
import type { MovementType, StockMovement } from "@/types/stock";

export interface StockMovementState {
  movements: StockMovement[];
}

const initialState: StockMovementState = {
  movements: stockMovements,
};

function nextId(): string {
  return `mov_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export interface NewMovementInput {
  productId: string;
  barcode: string;
  date: string;
  type: MovementType;
  reference: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  performedBy: string;
  reason: string;
}

const stockMovementsSlice = createSlice({
  name: "stockMovements",
  initialState,
  reducers: {
    addMovement: {
      prepare: (input: NewMovementInput) => ({ payload: { id: nextId(), ...input } }),
      reducer: (state, action: PayloadAction<StockMovement>) => {
        state.movements.unshift(action.payload);
      },
    },
  },
});

export const { addMovement } = stockMovementsSlice.actions;

interface RootStateWithStockMovements {
  stockMovements: StockMovementState;
}

export const selectStockMovements = (state: RootStateWithStockMovements) => state.stockMovements.movements;

export default stockMovementsSlice.reducer;
