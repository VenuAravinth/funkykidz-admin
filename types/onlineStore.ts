export const discountTypes = ["Percentage", "Fixed Amount"] as const;
export type DiscountType = (typeof discountTypes)[number];

export const couponConditionTypes = [
  "Category",
  "Product",
  "Brand",
  "Customer Group",
  "Minimum Order Value",
  "First Order",
  "New Customer",
  "Specific Dates",
  "Specific Payment Method",
] as const;
export type CouponConditionType = (typeof couponConditionTypes)[number];

export const couponStatuses = ["active", "scheduled", "expired", "disabled"] as const;
export type CouponStatus = (typeof couponStatuses)[number];

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrder?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  perCustomerLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  onlineOnly: boolean;
  allowPos: boolean;
  conditions: CouponConditionType[];
  status: CouponStatus;
}

export const onlineReturnStatuses = [
  "requested",
  "approved",
  "pickup_scheduled",
  "received",
  "inspection",
  "approved_for_refund",
  "refunded",
  "rejected",
] as const;
export type OnlineReturnStatus = (typeof onlineReturnStatuses)[number];

export const ONLINE_RETURN_FLOW: OnlineReturnStatus[] = [
  "requested",
  "approved",
  "pickup_scheduled",
  "received",
  "inspection",
  "approved_for_refund",
  "refunded",
];

export interface OnlineReturn {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  productId: string;
  barcode: string;
  product: string;
  quantity: number;
  amount: number;
  reason: string;
  status: OnlineReturnStatus;
  refundAmount?: number;
  createdDate: string;
}

export const reviewStatuses = ["pending", "approved", "hidden"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  adminResponse?: string;
  createdDate: string;
}

export interface HomepageBanner {
  id: string;
  title: string;
  buttonLabel: string;
  imageUrl?: string;
  active: boolean;
}

export interface StorefrontContent {
  heroTitle: string;
  heroButtonLabel: string;
  heroImageUrl?: string;
  announcementBar?: string;
  banners: HomepageBanner[];
  featuredProductIds: string[];
}

export const couriers = ["Delhivery", "DTDC", "Blue Dart", "India Post", "Shiprocket", "Other"] as const;
export type Courier = (typeof couriers)[number];

export interface OrderShippingDetail {
  orderId: string;
  courier?: Courier;
  shippingCost: number;
  expectedDelivery?: string;
}
