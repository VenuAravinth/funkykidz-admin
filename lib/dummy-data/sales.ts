export interface SalesTodayStats {
  todaySales: number;
  todayOrders: number;
  todayItemsSold: number;
  pendingPayments: number;
  returns: number;
}

export interface SalesMonthStats {
  monthSales: number;
  monthOrders: number;
  grossProfit: number;
}

export interface SalesTrendPoint {
  label: string;
  amount: number;
}

export interface CategorySalesRow {
  name: string;
  amount: number;
}

export interface PaymentMethodRow {
  name: string;
  amount: number;
}

export interface TopProductRow {
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface TopCustomerRow {
  name: string;
  orders: number;
  totalSpent: number;
}

export type SalesAlertSeverity = "warning" | "danger" | "info";

export interface SalesAlert {
  id: string;
  severity: SalesAlertSeverity;
  message: string;
  href?: string;
}

export const salesTodayStats: SalesTodayStats = {
  todaySales: 42_850,
  todayOrders: 38,
  todayItemsSold: 126,
  pendingPayments: 18_500,
  returns: 2_450,
};

export const salesMonthStats: SalesMonthStats = {
  monthSales: 8_45_000,
  monthOrders: 642,
  grossProfit: 2_85_000,
};

export function getAverageOrderValue(stats: SalesMonthStats): number {
  return Math.round(stats.monthSales / stats.monthOrders);
}

export const dailySalesTrend: SalesTrendPoint[] = [
  { label: "13 Aug", amount: 31_200 },
  { label: "14 Aug", amount: 28_900 },
  { label: "15 Aug", amount: 36_400 },
  { label: "16 Aug", amount: 33_750 },
  { label: "17 Aug", amount: 39_100 },
  { label: "18 Aug", amount: 45_600 },
  { label: "19 Aug", amount: 41_300 },
  { label: "20 Aug", amount: 29_800 },
  { label: "21 Aug", amount: 34_500 },
  { label: "22 Aug", amount: 37_900 },
  { label: "23 Aug", amount: 43_200 },
  { label: "24 Aug", amount: 48_100 },
  { label: "25 Aug", amount: 40_650 },
  { label: "26 Aug", amount: 42_850 },
];

export const weeklySalesTrend: SalesTrendPoint[] = [
  { label: "Wk 27", amount: 2_18_400 },
  { label: "Wk 28", amount: 2_35_900 },
  { label: "Wk 29", amount: 2_09_600 },
  { label: "Wk 30", amount: 2_47_300 },
  { label: "Wk 31", amount: 2_61_800 },
  { label: "Wk 32", amount: 2_28_500 },
  { label: "Wk 33", amount: 2_54_700 },
  { label: "Wk 34", amount: 2_43_150 },
];

export const monthlySalesTrend: SalesTrendPoint[] = [
  { label: "Sep 2025", amount: 6_82_000 },
  { label: "Oct 2025", amount: 7_15_400 },
  { label: "Nov 2025", amount: 8_92_600 },
  { label: "Dec 2025", amount: 9_84_300 },
  { label: "Jan 2026", amount: 7_41_200 },
  { label: "Feb 2026", amount: 6_98_500 },
  { label: "Mar 2026", amount: 7_26_900 },
  { label: "Apr 2026", amount: 7_58_100 },
  { label: "May 2026", amount: 7_93_400 },
  { label: "Jun 2026", amount: 8_12_700 },
  { label: "Jul 2026", amount: 8_29_600 },
  { label: "Aug 2026", amount: 8_45_000 },
];

export const salesByCategory: CategorySalesRow[] = [
  { name: "Boys Wear", amount: 2_45_300 },
  { name: "Girls Wear", amount: 2_68_900 },
  { name: "Infant Wear", amount: 1_42_600 },
  { name: "Footwear", amount: 96_400 },
  { name: "Accessories", amount: 58_200 },
  { name: "Toys & Others", amount: 33_600 },
];

export const salesByPaymentMethod: PaymentMethodRow[] = [
  { name: "UPI", amount: 3_38_000 },
  { name: "Card", amount: 2_45_500 },
  { name: "Cash", amount: 1_69_000 },
  { name: "Bank Transfer", amount: 67_500 },
  { name: "Credit", amount: 25_000 },
];

export const topSellingProducts: TopProductRow[] = [
  { name: "Cotton Printed Frock", unitsSold: 214, revenue: 1_07_000 },
  { name: "Boys Denim Shorts", unitsSold: 186, revenue: 74_400 },
  { name: "Infant Onesie Set", unitsSold: 172, revenue: 68_800 },
  { name: "Girls Party Dress", unitsSold: 149, revenue: 89_400 },
  { name: "Kids Canvas Sneakers", unitsSold: 138, revenue: 82_800 },
  { name: "Unisex Graphic Tee", unitsSold: 205, revenue: 61_500 },
  { name: "School Uniform Set", unitsSold: 118, revenue: 70_800 },
  { name: "Winter Hoodie", unitsSold: 96, revenue: 57_600 },
];

export const topCustomers: TopCustomerRow[] = [
  { name: "Little Stars Retail", orders: 42, totalSpent: 3_86_400 },
  { name: "Tiny Trends Boutique", orders: 35, totalSpent: 3_12_600 },
  { name: "Rainbow Kids Store", orders: 29, totalSpent: 2_64_800 },
  { name: "Bubblegum Fashion", orders: 24, totalSpent: 2_08_500 },
  { name: "Cherub Kidswear", orders: 21, totalSpent: 1_79_200 },
  { name: "Sunny Days Kids", orders: 18, totalSpent: 1_46_700 },
];

export const salesAlerts: SalesAlert[] = [
  { id: "alert-payments-pending", severity: "warning", message: "5 payments pending", href: "/payments" },
  { id: "alert-online-orders", severity: "warning", message: "3 online orders awaiting processing" },
  { id: "alert-quotations", severity: "warning", message: "8 quotations expiring soon" },
  { id: "alert-returns", severity: "warning", message: "4 returned items awaiting inspection" },
];
