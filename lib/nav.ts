import type { IconType } from "react-icons";
import {
  HiOutlineSquares2X2,
  HiOutlineTruck,
  HiOutlineChartBar,
  HiOutlineArchiveBox,
  HiOutlineShoppingCart,
  HiOutlineScale,
  HiOutlineUserGroup,
  HiOutlineCog6Tooth,
  HiOutlineShieldCheck,
  HiOutlineGlobeAlt,
  HiOutlineTag,
} from "react-icons/hi2";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavLeaf extends NavChild {
  icon: IconType;
}

export interface NavGroup {
  label: string;
  icon: IconType;
  children: NavChild[];
}

export type NavEntry = NavLeaf | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

export const NAV_SECTIONS: NavEntry[] = [
  { label: "Dashboard", href: "/dashboard", icon: HiOutlineSquares2X2 },
  {
    label: "Sales",
    icon: HiOutlineShoppingCart,
    children: [
      { label: "Sales Dashboard", href: "/sales" },
      { label: "POS / Billing", href: "/sales/pos" },
      { label: "Estimations", href: "/sales/estimations" },
      { label: "Quotations", href: "/sales/quotations" },
      { label: "Sales Orders", href: "/sales/orders" },
      { label: "Online Orders", href: "/sales/online-orders" },
      { label: "Invoices", href: "/sales/invoices" },
      { label: "Sales Returns", href: "/sales/returns" },
      { label: "Customer Payments", href: "/sales/payments" },
    ],
  },
  {
    label: "Customers",
    icon: HiOutlineUserGroup,
    children: [
      { label: "Customer List", href: "/customers" },
      { label: "Customer Groups", href: "/customers/groups" },
      { label: "Customer Credit", href: "/customers/credit" },
      { label: "Customer Ledger", href: "/customers/ledger" },
    ],
  },
  {
    label: "Product Management",
    icon: HiOutlineTag,
    children: [
      { label: "Products", href: "/inventory/products" },
      { label: "Categories", href: "/inventory/categories" },
      { label: "Brands", href: "/inventory/brands" },
    ],
  },
  {
    label: "Inventory",
    icon: HiOutlineArchiveBox,
    children: [
      { label: "Inventory Dashboard", href: "/inventory" },
      { label: "Stock Overview", href: "/inventory/stock-overview" },
      { label: "Stock Movement", href: "/inventory/stock-movement" },
      { label: "Stock Adjustment", href: "/inventory/stock-adjustment" },
      { label: "Stock Transfer", href: "/inventory/stock-transfer" },
      { label: "Low Stock", href: "/inventory/low-stock" },
      { label: "Out of Stock", href: "/inventory/out-of-stock" },
      { label: "Barcode / Labels", href: "/inventory/barcode-labels" },
    ],
  },
  {
    label: "Purchasing",
    icon: HiOutlineTruck,
    children: [
      { label: "Suppliers", href: "/suppliers" },
      { label: "Purchase Orders", href: "/purchase-orders" },
      { label: "Goods Received", href: "/goods-received" },
      { label: "Supplier Payments", href: "/payments" },
    ],
  },
  {
    label: "Online Store",
    icon: HiOutlineGlobeAlt,
    children: [
      { label: "Store Dashboard", href: "/online-store" },
      { label: "Online Products", href: "/online-store/products" },
      { label: "Online Customers", href: "/online-store/customers" },
      { label: "Online Payments", href: "/online-store/payments" },
      { label: "Shipping", href: "/online-store/shipping" },
      { label: "Returns & Refunds", href: "/online-store/returns" },
      { label: "Coupons", href: "/online-store/coupons" },
      { label: "Reviews", href: "/online-store/reviews" },
      { label: "Storefront Content", href: "/online-store/content" },
      { label: "Store Settings", href: "/online-store/settings" },
    ],
  },
  {
    label: "Finance",
    icon: HiOutlineScale,
    children: [
      { label: "Finance Dashboard", href: "/finance" },
      { label: "Transactions", href: "/finance/transactions" },
      { label: "Income", href: "/finance/income" },
      { label: "Expenses", href: "/finance/expenses" },
      { label: "Receivables", href: "/finance/receivables" },
      { label: "Payables", href: "/finance/payables" },
      { label: "Cash Management", href: "/finance/cash" },
      { label: "Bank Accounts", href: "/finance/bank-accounts" },
    ],
  },
  {
    label: "Reports",
    icon: HiOutlineChartBar,
    children: [
      { label: "Reports Home", href: "/reports" },
      { label: "Sales Reports", href: "/sales/reports" },
      { label: "Purchase Reports", href: "/reports/purchase" },
      { label: "Inventory Reports", href: "/inventory/reports" },
      { label: "Customer Reports", href: "/reports/customers" },
      { label: "Supplier Reports", href: "/reports/suppliers" },
      { label: "Payment Reports", href: "/reports/payments" },
      { label: "Expense Reports", href: "/reports/expenses" },
      { label: "Profit & Loss", href: "/finance/profit-loss" },
      { label: "Financial Reports", href: "/finance/reports" },
      { label: "GST Reports", href: "/reports/gst" },
      { label: "Tax Reports", href: "/reports/tax" },
    ],
  },
  {
    label: "Users & Access",
    icon: HiOutlineShieldCheck,
    children: [
      { label: "Users", href: "/users-access/users" },
      { label: "Staff", href: "/users-access/staff" },
      { label: "Roles & Permissions", href: "/users-access/roles" },
      { label: "Activity Logs", href: "/users-access/activity-logs" },
    ],
  },
  { label: "Settings", href: "/settings", icon: HiOutlineCog6Tooth },
];

const EXTRA_TITLES: NavChild[] = [{ label: "Notifications", href: "/notifications" }];

export function matchesHref(href: string, pathname: string): boolean {
  const url = new URL(href, "http://local");
  return pathname === url.pathname || pathname.startsWith(`${url.pathname}/`);
}

export interface ActiveNav {
  label: string;
  href: string;
  groupLabel?: string;
}

export function findActiveNav(pathname: string): ActiveNav | null {
  const flat: Array<{ label: string; href: string; groupLabel?: string }> = [];
  for (const entry of NAV_SECTIONS) {
    if (isNavGroup(entry)) {
      for (const child of entry.children) {
        flat.push({ label: child.label, href: child.href, groupLabel: entry.label });
      }
    } else {
      flat.push({ label: entry.label, href: entry.href });
    }
  }

  for (const extra of EXTRA_TITLES) flat.push(extra);

  const matches = flat.filter((item) => matchesHref(item.href, pathname));
  if (matches.length === 0) return null;

  return matches.reduce((best, item) => (item.href.length > best.href.length ? item : best));
}

export function findActiveGroup(pathname: string): string | null {
  return findActiveNav(pathname)?.groupLabel ?? null;
}

export function flatNavItems(): Array<{ label: string; href: string; groupLabel?: string }> {
  return NAV_SECTIONS.flatMap((entry) =>
    isNavGroup(entry)
      ? entry.children.map((child) => ({ ...child, groupLabel: entry.label }))
      : [{ label: entry.label, href: entry.href }],
  );
}
