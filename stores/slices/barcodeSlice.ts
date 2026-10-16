import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { barcodeHistory } from "@/lib/dummy-data/barcodeHistory";
import type { BarcodeBatch, BarcodeSettings } from "@/types/barcode";

export interface BarcodeState {
  history: BarcodeBatch[];
  settings: BarcodeSettings;
}

const initialState: BarcodeState = {
  history: barcodeHistory,
  settings: {
    labelSize: "40x25",
    showStoreName: true,
    showPrice: true,
    defaultQuantity: 20,
  },
};

function nextId(): string {
  return `bc_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export interface NewBarcodeBatchInput {
  productId: string;
  variantId?: string;
  barcode: string;
  quantity: number;
  generatedBy: string;
}

const barcodeSlice = createSlice({
  name: "barcode",
  initialState,
  reducers: {
    generateBarcodeBatch: {
      prepare: (input: NewBarcodeBatchInput) => ({
        payload: { id: nextId(), generatedAt: new Date().toISOString(), ...input },
      }),
      reducer: (state, action: PayloadAction<BarcodeBatch>) => {
        state.history.unshift(action.payload);
      },
    },
    updateBarcodeSettings: (state, action: PayloadAction<Partial<BarcodeSettings>>) => {
      Object.assign(state.settings, action.payload);
    },
  },
});

export const { generateBarcodeBatch, updateBarcodeSettings } = barcodeSlice.actions;

interface RootStateWithBarcode {
  barcode: BarcodeState;
}

export const selectBarcodeHistory = (state: RootStateWithBarcode) => state.barcode.history;
export const selectBarcodeSettings = (state: RootStateWithBarcode) => state.barcode.settings;

export default barcodeSlice.reducer;
