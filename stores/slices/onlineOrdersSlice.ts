import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { onlineOrders } from "@/lib/dummy-data/onlineOrders";
import type { OnlineOrder, OnlineOrderLineItem, OnlineOrderStatus, OrderPaymentStatus } from "@/types/onlineOrder";

export interface OnlineOrdersState {
  orders: OnlineOrder[];
}

const initialState: OnlineOrdersState = {
  orders: onlineOrders,
};

function nextId(): string {
  return `oo_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

function nextOrderNumber(existing: OnlineOrder[]): string {
  const highest = existing.reduce((max, o) => {
    const n = Number(o.orderNumber.replace("ORD-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 100000);
  return `ORD-${highest + 1}`;
}

export interface NewOnlineOrderInput {
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  shippingMethod: string;
  items: Array<Omit<OnlineOrderLineItem, "id">>;
}

const onlineOrdersSlice = createSlice({
  name: "onlineOrders",
  initialState,
  reducers: {
    addOnlineOrder: {
      prepare: (input: NewOnlineOrderInput) => {
        const now = new Date().toISOString();
        return {
          payload: {
            id: nextId(),
            orderNumber: "",
            status: "new" as OnlineOrderStatus,
            paymentStatus: "pending" as OrderPaymentStatus,
            stockFulfilled: false,
            createdDate: now.slice(0, 10),
            timeline: [{ status: "new" as OnlineOrderStatus, at: now, note: "Order placed on the online store." }],
            ...input,
            items: input.items.map((item, i) => ({ id: `oitem_${Date.now().toString(36)}${i}`, ...item })),
          } as OnlineOrder,
        };
      },
      reducer: (state, action: PayloadAction<OnlineOrder>) => {
        const order = { ...action.payload, orderNumber: nextOrderNumber(state.orders) };
        state.orders.unshift(order);
      },
    },
    setOnlineOrderStatus: (state, action: PayloadAction<{ id: string; status: OnlineOrderStatus; note?: string }>) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (!order) return;
      order.status = action.payload.status;
      order.timeline.push({ status: action.payload.status, at: new Date().toISOString(), note: action.payload.note });
    },
    markStockFulfilled: (state, action: PayloadAction<{ id: string }>) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) order.stockFulfilled = true;
    },
    setOnlineOrderPaymentStatus: (state, action: PayloadAction<{ id: string; status: OrderPaymentStatus }>) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) order.paymentStatus = action.payload.status;
    },
    setTrackingNumber: (state, action: PayloadAction<{ id: string; trackingNumber: string }>) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) order.trackingNumber = action.payload.trackingNumber;
    },
  },
});

export const { addOnlineOrder, setOnlineOrderStatus, markStockFulfilled, setOnlineOrderPaymentStatus, setTrackingNumber } =
  onlineOrdersSlice.actions;

interface RootStateWithOnlineOrders {
  onlineOrders: OnlineOrdersState;
}

export const selectOnlineOrders = (state: RootStateWithOnlineOrders) => state.onlineOrders.orders;
export const selectOnlineOrderById = (id: string) => (state: RootStateWithOnlineOrders) =>
  state.onlineOrders.orders.find((o) => o.id === id);

export default onlineOrdersSlice.reducer;
