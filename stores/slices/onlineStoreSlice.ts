import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  coupons,
  onlineReturns,
  orderShippingDetails,
  productReviews,
  storefrontContent,
} from "@/lib/dummy-data/onlineStore";
import type {
  Coupon,
  CouponStatus,
  HomepageBanner,
  OnlineReturn,
  OnlineReturnStatus,
  OrderShippingDetail,
  ProductReview,
  ReviewStatus,
  StorefrontContent,
} from "@/types/onlineStore";

export interface OnlineStoreState {
  coupons: Coupon[];
  returns: OnlineReturn[];
  reviews: ProductReview[];
  content: StorefrontContent;
  shippingDetails: OrderShippingDetail[];
}

const initialState: OnlineStoreState = {
  coupons,
  returns: onlineReturns,
  reviews: productReviews,
  content: storefrontContent,
  shippingDetails: orderShippingDetails,
};

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export type NewCouponInput = Omit<Coupon, "id" | "usedCount" | "status">;

const onlineStoreSlice = createSlice({
  name: "onlineStore",
  initialState,
  reducers: {
    addCoupon: {
      prepare: (input: NewCouponInput) => {
        const today = new Date().toISOString().slice(0, 10);
        const status: CouponStatus = input.startDate > today ? "scheduled" : "active";
        return { payload: { id: nextId("cpn"), usedCount: 0, status, ...input } as Coupon };
      },
      reducer: (state, action: PayloadAction<Coupon>) => {
        state.coupons.unshift(action.payload);
      },
    },
    updateCoupon: (state, action: PayloadAction<{ id: string; input: NewCouponInput }>) => {
      const coupon = state.coupons.find((c) => c.id === action.payload.id);
      if (coupon) Object.assign(coupon, action.payload.input);
    },
    setCouponStatus: (state, action: PayloadAction<{ id: string; status: CouponStatus }>) => {
      const coupon = state.coupons.find((c) => c.id === action.payload.id);
      if (coupon) coupon.status = action.payload.status;
    },

    setOnlineReturnStatus: (
      state,
      action: PayloadAction<{ id: string; status: OnlineReturnStatus; refundAmount?: number }>,
    ) => {
      const ret = state.returns.find((r) => r.id === action.payload.id);
      if (!ret) return;
      ret.status = action.payload.status;
      if (action.payload.refundAmount !== undefined) ret.refundAmount = action.payload.refundAmount;
    },

    setReviewStatus: (state, action: PayloadAction<{ id: string; status: ReviewStatus }>) => {
      const review = state.reviews.find((r) => r.id === action.payload.id);
      if (review) review.status = action.payload.status;
    },
    respondToReview: (state, action: PayloadAction<{ id: string; response: string }>) => {
      const review = state.reviews.find((r) => r.id === action.payload.id);
      if (review) review.adminResponse = action.payload.response;
    },
    deleteReview: (state, action: PayloadAction<string>) => {
      state.reviews = state.reviews.filter((r) => r.id !== action.payload);
    },

    updateStorefrontContent: (
      state,
      action: PayloadAction<Partial<Omit<StorefrontContent, "banners" | "featuredProductIds">>>,
    ) => {
      Object.assign(state.content, action.payload);
    },
    setFeaturedProducts: (state, action: PayloadAction<string[]>) => {
      state.content.featuredProductIds = action.payload;
    },
    setBanners: (state, action: PayloadAction<HomepageBanner[]>) => {
      state.content.banners = action.payload;
    },
    addBanner: {
      prepare: (input: Omit<HomepageBanner, "id">) => ({ payload: { id: nextId("bnr"), ...input } as HomepageBanner }),
      reducer: (state, action: PayloadAction<HomepageBanner>) => {
        state.content.banners.push(action.payload);
      },
    },
    updateBanner: (state, action: PayloadAction<{ id: string; changes: Partial<Omit<HomepageBanner, "id">> }>) => {
      const banner = state.content.banners.find((b) => b.id === action.payload.id);
      if (banner) Object.assign(banner, action.payload.changes);
    },
    removeBanner: (state, action: PayloadAction<string>) => {
      state.content.banners = state.content.banners.filter((b) => b.id !== action.payload);
    },

    setOrderShippingDetail: (
      state,
      action: PayloadAction<{ orderId: string; changes: Partial<Omit<OrderShippingDetail, "orderId">> }>,
    ) => {
      const existing = state.shippingDetails.find((d) => d.orderId === action.payload.orderId);
      if (existing) {
        Object.assign(existing, action.payload.changes);
      } else {
        state.shippingDetails.push({ orderId: action.payload.orderId, shippingCost: 80, ...action.payload.changes });
      }
    },
  },
});

export const {
  addCoupon,
  updateCoupon,
  setCouponStatus,
  setOnlineReturnStatus,
  setReviewStatus,
  respondToReview,
  deleteReview,
  updateStorefrontContent,
  setFeaturedProducts,
  setBanners,
  addBanner,
  updateBanner,
  removeBanner,
  setOrderShippingDetail,
} = onlineStoreSlice.actions;

interface RootStateWithOnlineStore {
  onlineStore: OnlineStoreState;
}

export const selectCoupons = (state: RootStateWithOnlineStore) => state.onlineStore.coupons;
export const selectOnlineReturns = (state: RootStateWithOnlineStore) => state.onlineStore.returns;
export const selectProductReviews = (state: RootStateWithOnlineStore) => state.onlineStore.reviews;
export const selectStorefrontContent = (state: RootStateWithOnlineStore) => state.onlineStore.content;
export const selectShippingDetails = (state: RootStateWithOnlineStore) => state.onlineStore.shippingDetails;
export const selectShippingDetailByOrderId = (orderId: string) => (state: RootStateWithOnlineStore) =>
  state.onlineStore.shippingDetails.find((d) => d.orderId === orderId);

export default onlineStoreSlice.reducer;
