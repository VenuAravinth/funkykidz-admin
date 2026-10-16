"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import {
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineTicket,
  HiOutlineUserGroup,
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineCog6Tooth,
  HiOutlinePhoto,
  HiOutlineArrowUturnLeft,
  HiOutlineStar,
  HiChevronRight,
  HiOutlineGlobeAlt,
  HiOutlineInboxArrowDown,
  HiOutlineBanknotes,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { StatTile } from "@/components/molecules/StatTile";
import { formatCurrency } from "@/lib/format";
import { onlineOrderTotal } from "@/lib/dummy-data/onlineOrders";
import { useAppSelector } from "@/stores/hooks";
import { selectOnlineOrders } from "@/stores/slices/onlineOrdersSlice";
import { selectCoupons, selectOnlineReturns, selectProductReviews } from "@/stores/slices/onlineStoreSlice";
import { selectProducts } from "@/stores/slices/catalogSlice";

interface OnlineStoreLink {
  label: string;
  href: string;
  description: string;
  icon: IconType;
}

const ONLINE_STORE_LINKS: OnlineStoreLink[] = [
  { label: "Online Products", href: "/online-store/products", description: "Control which products are available on your website.", icon: HiOutlineCube },
  { label: "Online Orders", href: "/sales/online-orders", description: "Manage orders coming from your online store.", icon: HiOutlineShoppingCart },
  { label: "Coupons", href: "/online-store/coupons", description: "Create and manage online discount codes.", icon: HiOutlineTicket },
  { label: "Online Customers", href: "/online-store/customers", description: "Customers who've ordered from your website.", icon: HiOutlineUserGroup },
  { label: "Shipping", href: "/online-store/shipping", description: "Couriers, tracking, and delivery status.", icon: HiOutlineTruck },
  { label: "Online Payments", href: "/online-store/payments", description: "Payments tied to online orders.", icon: HiOutlineCreditCard },
  { label: "Returns & Refunds", href: "/online-store/returns", description: "The online return and refund workflow.", icon: HiOutlineArrowUturnLeft },
  { label: "Reviews", href: "/online-store/reviews", description: "Moderate product reviews.", icon: HiOutlineStar },
  { label: "Storefront Content", href: "/online-store/content", description: "Homepage banners and announcements.", icon: HiOutlinePhoto },
  { label: "Store Settings", href: "/online-store/settings", description: "Controls how your online storefront behaves.", icon: HiOutlineCog6Tooth },
];

export default function OnlineStoreDashboardPage() {
  const orders = useAppSelector(selectOnlineOrders);
  const products = useAppSelector(selectProducts);
  const coupons = useAppSelector(selectCoupons);
  const returns = useAppSelector(selectOnlineReturns);
  const reviews = useAppSelector(selectProductReviews);

  const newOrders = orders.filter((o) => o.status === "new").length;
  const onlineProducts = products.filter((p) => p.published).length;
  const activeCoupons = coupons.filter((c) => c.status === "active").length;
  const pendingReturns = returns.filter((r) => !["refunded", "rejected"].includes(r.status)).length;
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;
  const todaysSales = orders
    .filter((o) => o.createdDate === new Date().toISOString().slice(0, 10) && o.paymentStatus === "paid")
    .reduce((sum, o) => sum + onlineOrderTotal(o), 0);

  return (
    <div>
      <PageHeader title="Online Store" subtitle="Everything that runs your website — products, orders, coupons, and more." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatTile label="New Orders" value={String(newOrders)} icon={<HiOutlineInboxArrowDown className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Today's Sales" value={formatCurrency(todaysSales)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Online Products" value={String(onlineProducts)} icon={<HiOutlineGlobeAlt className="h-5 w-5" />} tone="sky" />
        <StatTile label="Active Coupons" value={String(activeCoupons)} icon={<HiOutlineTicket className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Open Returns" value={String(pendingReturns)} icon={<HiOutlineArrowUturnLeft className="h-5 w-5" />} tone="rose" />
        <StatTile label="Pending Reviews" value={String(pendingReviews)} icon={<HiOutlineStar className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ONLINE_STORE_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="flex items-start gap-3.5 p-5 transition-colors hover:bg-white/60">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne-100 text-champagne-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-ink">{item.label}</h2>
                    <HiChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{item.description}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
