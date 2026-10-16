import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartLineItem, DiscountType, SaleTab } from "@/types/pos";

export interface PosState {
  tabs: SaleTab[];
  activeTabId: string;
  nextSaleNumber: number;
}

export const DEFAULT_CUSTOMER = "Walk-in Customer";
const DEFAULT_GST_PERCENT = 5;

function nextTabId(): string {
  return `sale_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

function createBlankTab(number: number): SaleTab {
  return {
    id: nextTabId(),
    number,
    status: "active",
    createdAt: new Date().toISOString(),
    customerName: DEFAULT_CUSTOMER,
    customerPhone: "",
    isWalkIn: true,
    items: [],
    billDiscountType: "percent",
    billDiscountValue: 0,
    taxMode: "exclusive",
    gstPercent: DEFAULT_GST_PERCENT,
    roundOffMode: "off",
    couponCode: undefined,
  };
}

const firstTab = createBlankTab(1);

const initialState: PosState = {
  tabs: [firstTab],
  activeTabId: firstTab.id,
  nextSaleNumber: 2,
};

export interface AddCartItemInput {
  key: string;
  productId: string;
  variantId?: string;
  barcode: string;
  name: string;
  price: number;
  availableStock: number;
}

function clampQuantity(quantity: number, availableStock: number): number {
  return Math.max(0, Math.min(quantity, availableStock));
}

function getActiveTab(state: PosState): SaleTab | undefined {
  return state.tabs.find((t) => t.id === state.activeTabId);
}

function removeTabAndEnsureActive(state: PosState, id: string) {
  state.tabs = state.tabs.filter((t) => t.id !== id);
  if (state.tabs.length === 0) {
    const blank = createBlankTab(state.nextSaleNumber++);
    state.tabs.push(blank);
    state.activeTabId = blank.id;
    return;
  }
  if (state.activeTabId === id) {
    const nextActive = state.tabs.find((t) => t.status === "active") ?? state.tabs[0];
    state.activeTabId = nextActive.id;
  }
}

const posSlice = createSlice({
  name: "pos",
  initialState,
  reducers: {
    addCartItem: (state, action: PayloadAction<AddCartItemInput>) => {
      const tab = getActiveTab(state);
      if (!tab) return;
      const input = action.payload;
      if (input.availableStock <= 0) return;
      const existing = tab.items.find((item) => item.key === input.key);
      if (existing) {
        existing.quantity = clampQuantity(existing.quantity + 1, input.availableStock);
        existing.availableStock = input.availableStock;
      } else {
        const item: CartLineItem = { ...input, quantity: 1, discountType: "amount", discountValue: 0 };
        tab.items.push(item);
      }
    },
    incrementCartItem: (state, action: PayloadAction<{ key: string }>) => {
      const tab = getActiveTab(state);
      const item = tab?.items.find((i) => i.key === action.payload.key);
      if (item) item.quantity = clampQuantity(item.quantity + 1, item.availableStock);
    },
    decrementCartItem: (state, action: PayloadAction<{ key: string }>) => {
      const tab = getActiveTab(state);
      if (!tab) return;
      const item = tab.items.find((i) => i.key === action.payload.key);
      if (!item) return;
      if (item.quantity <= 1) {
        tab.items = tab.items.filter((i) => i.key !== action.payload.key);
      } else {
        item.quantity -= 1;
      }
    },
    setCartItemQuantity: (state, action: PayloadAction<{ key: string; quantity: number }>) => {
      const tab = getActiveTab(state);
      if (!tab) return;
      const item = tab.items.find((i) => i.key === action.payload.key);
      if (!item) return;
      const clamped = clampQuantity(action.payload.quantity, item.availableStock);
      if (clamped <= 0) {
        tab.items = tab.items.filter((i) => i.key !== action.payload.key);
      } else {
        item.quantity = clamped;
      }
    },
    removeCartItem: (state, action: PayloadAction<{ key: string }>) => {
      const tab = getActiveTab(state);
      if (!tab) return;
      tab.items = tab.items.filter((i) => i.key !== action.payload.key);
    },
    setCustomerDetails: (state, action: PayloadAction<{ name: string; phone: string; isWalkIn: boolean }>) => {
      const tab = getActiveTab(state);
      if (!tab) return;
      tab.customerName = action.payload.name;
      tab.customerPhone = action.payload.phone;
      tab.isWalkIn = action.payload.isWalkIn;
    },
    setBillDiscount: (state, action: PayloadAction<{ type: DiscountType; value: number }>) => {
      const tab = getActiveTab(state);
      if (!tab) return;
      tab.billDiscountType = action.payload.type;
      tab.billDiscountValue = action.payload.value;
      tab.couponCode = undefined;
    },
    updateCartItemDiscount: (state, action: PayloadAction<{ key: string; discountType: DiscountType; discountValue: number }>) => {
      const tab = getActiveTab(state);
      const item = tab?.items.find((i) => i.key === action.payload.key);
      if (!item) return;
      item.discountType = action.payload.discountType;
      item.discountValue = action.payload.discountValue;
    },
    setGstPercent: (state, action: PayloadAction<number>) => {
      const tab = getActiveTab(state);
      if (tab) tab.gstPercent = action.payload;
    },
    setTaxIncluded: (state, action: PayloadAction<boolean>) => {
      const tab = getActiveTab(state);
      if (tab) tab.taxMode = action.payload ? "inclusive" : "exclusive";
    },
    applyCoupon: (state, action: PayloadAction<{ code: string; percent: number }>) => {
      const tab = getActiveTab(state);
      if (!tab) return;
      tab.billDiscountType = "percent";
      tab.billDiscountValue = action.payload.percent;
      tab.couponCode = action.payload.code;
    },
    clearCoupon: (state) => {
      const tab = getActiveTab(state);
      if (tab) tab.couponCode = undefined;
    },
    newSaleTab: (state) => {
      const tab = createBlankTab(state.nextSaleNumber++);
      state.tabs.push(tab);
      state.activeTabId = tab.id;
    },
    switchTab: (state, action: PayloadAction<{ id: string }>) => {
      const tab = state.tabs.find((t) => t.id === action.payload.id);
      if (!tab) return;
      tab.status = "active";
      state.activeTabId = tab.id;
    },
    holdActiveTab: (state) => {
      const tab = getActiveTab(state);
      if (!tab || tab.items.length === 0) return;
      tab.status = "held";
      const nextActive = state.tabs.find((t) => t.id !== tab.id && t.status === "active");
      if (nextActive) {
        state.activeTabId = nextActive.id;
      } else {
        const blank = createBlankTab(state.nextSaleNumber++);
        state.tabs.push(blank);
        state.activeTabId = blank.id;
      }
    },
    cancelTab: (state, action: PayloadAction<{ id: string }>) => {
      removeTabAndEnsureActive(state, action.payload.id);
    },
    closeTabAfterSale: (state, action: PayloadAction<{ id: string }>) => {
      removeTabAndEnsureActive(state, action.payload.id);
    },
  },
});

export const {
  addCartItem,
  incrementCartItem,
  decrementCartItem,
  setCartItemQuantity,
  removeCartItem,
  setCustomerDetails,
  setBillDiscount,
  updateCartItemDiscount,
  setGstPercent,
  setTaxIncluded,
  applyCoupon,
  clearCoupon,
  newSaleTab,
  switchTab,
  holdActiveTab,
  cancelTab,
  closeTabAfterSale,
} = posSlice.actions;

interface RootStateWithPos {
  pos: PosState;
}

export const selectTabs = (state: RootStateWithPos) => state.pos.tabs;
export const selectActiveTabId = (state: RootStateWithPos) => state.pos.activeTabId;
export const selectActiveTab = (state: RootStateWithPos) => state.pos.tabs.find((t) => t.id === state.pos.activeTabId);

export default posSlice.reducer;
