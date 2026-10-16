import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { estimations } from "@/lib/dummy-data/estimations";
import type { Estimation, EstimationLineItem, EstimationStatus } from "@/types/estimation";

export interface EstimationsState {
  estimations: Estimation[];
}

const initialState: EstimationsState = {
  estimations,
};

function nextId(): string {
  return `est_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

function nextEstimationNumber(existing: Estimation[]): string {
  const highest = existing.reduce((max, e) => {
    const n = Number(e.estimationNumber.replace("EST-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 1000);
  return `EST-${highest + 1}`;
}

export interface NewEstimationInput {
  customerName: string;
  validUntil: string;
  discount: number;
  tax: number;
  notes?: string;
  items: Array<Omit<EstimationLineItem, "id">>;
}

const estimationsSlice = createSlice({
  name: "estimations",
  initialState,
  reducers: {
    addEstimation: {
      prepare: (input: NewEstimationInput) => ({
        payload: {
          id: nextId(),
          estimationNumber: "",
          status: "draft" as EstimationStatus,
          createdDate: new Date().toISOString().slice(0, 10),
          ...input,
          items: input.items.map((item, i) => ({ id: `eitem_${Date.now().toString(36)}${i}`, ...item })),
        } as Estimation,
      }),
      reducer: (state, action: PayloadAction<Estimation>) => {
        const estimation = { ...action.payload, estimationNumber: nextEstimationNumber(state.estimations) };
        state.estimations.unshift(estimation);
      },
    },
    setEstimationStatus: (state, action: PayloadAction<{ id: string; status: EstimationStatus }>) => {
      const estimation = state.estimations.find((e) => e.id === action.payload.id);
      if (estimation) estimation.status = action.payload.status;
    },
  },
});

export const { addEstimation, setEstimationStatus } = estimationsSlice.actions;

interface RootStateWithEstimations {
  estimations: EstimationsState;
}

export const selectEstimations = (state: RootStateWithEstimations) => state.estimations.estimations;
export const selectEstimationById = (id: string) => (state: RootStateWithEstimations) =>
  state.estimations.estimations.find((e) => e.id === id);

export default estimationsSlice.reducer;
