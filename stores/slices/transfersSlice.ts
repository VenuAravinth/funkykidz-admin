import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { locations } from "@/lib/dummy-data/locations";
import { locationStock } from "@/lib/dummy-data/locationStock";
import { transfers } from "@/lib/dummy-data/transfers";
import type { Location } from "@/types/location";
import type { StockTransfer, TransferStatus } from "@/types/transfer";

export interface TransfersState {
  locations: Location[];
  stockByLocation: Record<string, Record<string, number>>;
  transfers: StockTransfer[];
}

const initialState: TransfersState = {
  locations,
  stockByLocation: locationStock,
  transfers,
};

function nextId(): string {
  return `trf_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export interface NewTransferInput {
  fromLocationId: string;
  toLocationId: string;
  productId: string;
  quantity: number;
  reason: string;
  requestedBy: string;
}

const transfersSlice = createSlice({
  name: "transfers",
  initialState,
  reducers: {
    createTransfer: {
      prepare: (input: NewTransferInput) => ({ payload: { id: nextId(), createdAt: new Date().toISOString(), ...input } }),
      reducer: (state, action: PayloadAction<NewTransferInput & { id: string; createdAt: string }>) => {
        const { id, createdAt, ...input } = action.payload;
        const transferNumber = `TRF-${String(state.transfers.length + 1).padStart(4, "0")}`;
        state.transfers.unshift({
          id,
          transferNumber,
          ...input,
          status: "draft",
          history: [{ status: "draft", at: createdAt, by: input.requestedBy }],
          createdAt,
        });
      },
    },
    advanceTransfer: (state, action: PayloadAction<{ id: string; to: TransferStatus; by: string }>) => {
      const { id, to, by } = action.payload;
      const transfer = state.transfers.find((t) => t.id === id);
      if (!transfer) return;

      transfer.status = to;
      transfer.history.push({ status: to, at: new Date().toISOString(), by });

      if (to === "in_transit") {
        const productStock = state.stockByLocation[transfer.productId] ?? {};
        productStock[transfer.fromLocationId] = (productStock[transfer.fromLocationId] ?? 0) - transfer.quantity;
        state.stockByLocation[transfer.productId] = productStock;
      }
      if (to === "received") {
        const productStock = state.stockByLocation[transfer.productId] ?? {};
        productStock[transfer.toLocationId] = (productStock[transfer.toLocationId] ?? 0) + transfer.quantity;
        state.stockByLocation[transfer.productId] = productStock;
      }
    },
  },
});

export const { createTransfer, advanceTransfer } = transfersSlice.actions;

interface RootStateWithTransfers {
  transfers: TransfersState;
}

export const selectLocations = (state: RootStateWithTransfers) => state.transfers.locations;
export const selectStockByLocation = (state: RootStateWithTransfers) => state.transfers.stockByLocation;
export const selectTransfers = (state: RootStateWithTransfers) => state.transfers.transfers;
export const selectAvailableAt = (state: RootStateWithTransfers, productId: string, locationId: string): number =>
  state.transfers.stockByLocation[productId]?.[locationId] ?? 0;

export default transfersSlice.reducer;
