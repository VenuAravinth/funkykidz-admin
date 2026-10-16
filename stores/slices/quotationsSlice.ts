import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { quotations } from "@/lib/dummy-data/quotations";
import type { Quotation, QuotationLineItem, QuotationStatus } from "@/types/quotation";

export interface QuotationsState {
  quotations: Quotation[];
}

const initialState: QuotationsState = {
  quotations,
};

function nextId(): string {
  return `quo_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

function nextQuotationNumber(existing: Quotation[]): string {
  const highest = existing.reduce((max, q) => {
    const n = Number(q.quotationNumber.replace("QUO-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 1000);
  return `QUO-${highest + 1}`;
}

export interface NewQuotationInput {
  customerName: string;
  salesperson: string;
  validUntil: string;
  discount: number;
  tax: number;
  notes?: string;
  items: Array<Omit<QuotationLineItem, "id">>;
  estimationId?: string;
}

export interface UpdateQuotationInput extends NewQuotationInput {
  id: string;
}

const quotationsSlice = createSlice({
  name: "quotations",
  initialState,
  reducers: {
    addQuotation: {
      prepare: (input: NewQuotationInput) => ({
        payload: {
          id: nextId(),
          quotationNumber: "",
          status: "draft" as QuotationStatus,
          createdDate: new Date().toISOString().slice(0, 10),
          ...input,
          items: input.items.map((item, i) => ({ id: `qitem_${Date.now().toString(36)}${i}`, ...item })),
        } as Quotation,
      }),
      reducer: (state, action: PayloadAction<Quotation>) => {
        const quotation = { ...action.payload, quotationNumber: nextQuotationNumber(state.quotations) };
        state.quotations.unshift(quotation);
      },
    },
    updateQuotation: (state, action: PayloadAction<UpdateQuotationInput>) => {
      const quotation = state.quotations.find((q) => q.id === action.payload.id);
      if (!quotation) return;
      const input = action.payload;
      Object.assign(quotation, {
        customerName: input.customerName,
        salesperson: input.salesperson,
        validUntil: input.validUntil,
        discount: input.discount,
        tax: input.tax,
        notes: input.notes,
        items: input.items.map((item, i) => ({ id: quotation.items[i]?.id ?? `qitem_${Date.now().toString(36)}${i}`, ...item })),
      });
    },
    setQuotationStatus: (state, action: PayloadAction<{ id: string; status: QuotationStatus }>) => {
      const quotation = state.quotations.find((q) => q.id === action.payload.id);
      if (quotation) quotation.status = action.payload.status;
    },
  },
});

export const { addQuotation, updateQuotation, setQuotationStatus } = quotationsSlice.actions;

interface RootStateWithQuotations {
  quotations: QuotationsState;
}

export const selectQuotations = (state: RootStateWithQuotations) => state.quotations.quotations;
export const selectQuotationById = (id: string) => (state: RootStateWithQuotations) =>
  state.quotations.quotations.find((q) => q.id === id);

export default quotationsSlice.reducer;
