export type DiscountType = "amount" | "percent";
export type TaxMode = "inclusive" | "exclusive" | "none";
export type RoundOffMode = "auto" | "nearest5" | "nearest10" | "off";
export type SaleTabStatus = "active" | "held";

export interface CartLineItem {
  key: string;
  productId: string;
  variantId?: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  availableStock: number;
  originalPrice?: number;
  discountType: DiscountType;
  discountValue: number;
}

export interface SaleTab {
  id: string;
  number: number;
  status: SaleTabStatus;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  isWalkIn: boolean;
  items: CartLineItem[];
  billDiscountType: DiscountType;
  billDiscountValue: number;
  taxMode: TaxMode;
  gstPercent: number;
  roundOffMode: RoundOffMode;
  couponCode?: string;
}

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "credit", label: "Credit" },
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];
