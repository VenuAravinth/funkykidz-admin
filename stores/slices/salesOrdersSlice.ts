import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { salesOrders } from "@/lib/dummy-data/salesOrders";
import type { OrderStatus, OrderPaymentStatus, SalesOrder, SalesOrderLineItem } from "@/types/salesOrder";

export interface SalesOrdersState {
  salesOrders: SalesOrder[];
}

const initialState: SalesOrdersState = {
  salesOrders,
};

function nextId(): string {
  return `so_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

function nextSoNumber(existing: SalesOrder[]): string {
  const highest = existing.reduce((max, o) => {
    const n = Number(o.soNumber.replace("SO-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 1000);
  return `SO-${highest + 1}`;
}

export interface NewSalesOrderInput {
  customerName: string;
  deliveryDate: string;
  paymentStatus: OrderPaymentStatus;
  paidAmount: number;
  discount: number;
  tax: number;
  notes?: string;
  items: Array<Omit<SalesOrderLineItem, "id">>;
  quotationId?: string;
}

export interface UpdateSalesOrderInput extends NewSalesOrderInput {
  id: string;
}

const salesOrdersSlice = createSlice({
  name: "salesOrders",
  initialState,
  reducers: {
    addSalesOrder: {
      prepare: (input: NewSalesOrderInput) => ({
        payload: {
          id: nextId(),
          soNumber: "",
          status: "confirmed" as OrderStatus,
          fulfillmentStatus: "pending",
          createdDate: new Date().toISOString().slice(0, 10),
          ...input,
          items: input.items.map((item, i) => ({ id: `soitem_${Date.now().toString(36)}${i}`, ...item })),
        } as SalesOrder,
      }),
      reducer: (state, action: PayloadAction<SalesOrder>) => {
        const order = { ...action.payload, soNumber: nextSoNumber(state.salesOrders) };
        state.salesOrders.unshift(order);
      },
    },
    updateSalesOrder: (state, action: PayloadAction<UpdateSalesOrderInput>) => {
      const order = state.salesOrders.find((o) => o.id === action.payload.id);
      if (!order) return;
      const input = action.payload;
      Object.assign(order, {
        customerName: input.customerName,
        deliveryDate: input.deliveryDate,
        paymentStatus: input.paymentStatus,
        paidAmount: input.paidAmount,
        discount: input.discount,
        tax: input.tax,
        notes: input.notes,
        items: input.items.map((item, i) => ({ id: order.items[i]?.id ?? `soitem_${Date.now().toString(36)}${i}`, ...item })),
      });
    },
    setOrderStatus: (state, action: PayloadAction<{ id: string; status: OrderStatus }>) => {
      const order = state.salesOrders.find((o) => o.id === action.payload.id);
      if (order) order.status = action.payload.status;
    },
  },
});

export const { addSalesOrder, updateSalesOrder, setOrderStatus } = salesOrdersSlice.actions;

interface RootStateWithSalesOrders {
  salesOrders: SalesOrdersState;
}

export const selectSalesOrders = (state: RootStateWithSalesOrders) => state.salesOrders.salesOrders;
export const selectSalesOrderById = (id: string) => (state: RootStateWithSalesOrders) =>
  state.salesOrders.salesOrders.find((o) => o.id === id);
export const selectSalesOrderByQuotationId = (quotationId: string) => (state: RootStateWithSalesOrders) =>
  state.salesOrders.salesOrders.find((o) => o.quotationId === quotationId);

export default salesOrdersSlice.reducer;
