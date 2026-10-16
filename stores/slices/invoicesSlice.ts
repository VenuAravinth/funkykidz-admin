import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { invoices, invoiceGrandTotal } from "@/lib/dummy-data/invoices";
import type { Invoice, InvoiceLineItem, InvoiceStatus } from "@/types/invoice";

export interface InvoicesState {
  invoices: Invoice[];
}

const initialState: InvoicesState = {
  invoices,
};

function nextId(): string {
  return `inv_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

function nextInvoiceNumber(existing: Invoice[]): string {
  const highest = existing.reduce((max, i) => {
    const n = Number(i.invoiceNumber.split("-").pop());
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  const year = new Date().getFullYear();
  return `INV-${year}-${String(highest + 1).padStart(5, "0")}`;
}

export interface NewInvoiceInput {
  customerName: string;
  customerPhone: string;
  discountAmount: number;
  gstPercent: number;
  paidAmount: number;
  notes?: string;
  items: Array<Omit<InvoiceLineItem, "id">>;
  salesOrderId?: string;
  paymentMethod?: string;
  salesperson?: string;
  status?: InvoiceStatus;
}

export interface UpdateInvoiceInput extends NewInvoiceInput {
  id: string;
}

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    addInvoice: {
      prepare: (input: NewInvoiceInput) => ({
        payload: {
          id: nextId(),
          invoiceNumber: "",
          status: "draft" as InvoiceStatus,
          createdDate: new Date().toISOString().slice(0, 10),
          ...input,
          items: input.items.map((item, i) => ({ id: `invitem_${Date.now().toString(36)}${i}`, ...item })),
        } as Invoice,
      }),
      reducer: (state, action: PayloadAction<Invoice>) => {
        const invoice = { ...action.payload, invoiceNumber: nextInvoiceNumber(state.invoices) };
        state.invoices.unshift(invoice);
      },
    },
    updateInvoice: (state, action: PayloadAction<UpdateInvoiceInput>) => {
      const invoice = state.invoices.find((i) => i.id === action.payload.id);
      if (!invoice) return;
      const input = action.payload;
      Object.assign(invoice, {
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        discountAmount: input.discountAmount,
        gstPercent: input.gstPercent,
        paidAmount: input.paidAmount,
        notes: input.notes,
        items: input.items.map((item, i) => ({ id: invoice.items[i]?.id ?? `invitem_${Date.now().toString(36)}${i}`, ...item })),
      });
    },
    setInvoiceStatus: (state, action: PayloadAction<{ id: string; status: InvoiceStatus }>) => {
      const invoice = state.invoices.find((i) => i.id === action.payload.id);
      if (invoice) invoice.status = action.payload.status;
    },
    recordPayment: (state, action: PayloadAction<{ id: string; amount: number }>) => {
      const invoice = state.invoices.find((i) => i.id === action.payload.id);
      if (!invoice) return;
      invoice.paidAmount += action.payload.amount;
      invoice.status = invoice.paidAmount >= invoiceGrandTotal(invoice) ? "paid" : "partially_paid";
    },
    reverseInvoicePayment: (state, action: PayloadAction<{ id: string; amount: number }>) => {
      const invoice = state.invoices.find((i) => i.id === action.payload.id);
      if (!invoice) return;
      invoice.paidAmount = Math.max(0, invoice.paidAmount - action.payload.amount);
      if (invoice.paidAmount <= 0) invoice.status = "issued";
      else if (invoice.paidAmount < invoiceGrandTotal(invoice)) invoice.status = "partially_paid";
    },
  },
});

export const { addInvoice, updateInvoice, setInvoiceStatus, recordPayment, reverseInvoicePayment } = invoicesSlice.actions;

interface RootStateWithInvoices {
  invoices: InvoicesState;
}

export const selectInvoices = (state: RootStateWithInvoices) => state.invoices.invoices;
export const selectInvoiceById = (id: string) => (state: RootStateWithInvoices) =>
  state.invoices.invoices.find((i) => i.id === id);
export const selectInvoiceBySalesOrderId = (salesOrderId: string) => (state: RootStateWithInvoices) =>
  state.invoices.invoices.find((i) => i.salesOrderId === salesOrderId);

export default invoicesSlice.reducer;
