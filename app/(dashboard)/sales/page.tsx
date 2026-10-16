import type { Metadata } from "next";
import Link from "next/link";
import {
  HiOutlineCurrencyRupee,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineBanknotes,
  HiOutlineArrowUturnLeft,
  HiOutlineChartBar,
  HiOutlineClipboardDocumentCheck,
  HiOutlineReceiptPercent,
  HiOutlinePresentationChartBar,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { SalesTrendChart } from "@/components/organisms/charts/SalesTrendChart";
import { SalesSplitChart } from "@/components/organisms/charts/SalesSplitChart";
import { TopProductsChart } from "@/components/organisms/charts/TopProductsChart";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import {
  salesTodayStats,
  salesMonthStats,
  getAverageOrderValue,
  dailySalesTrend,
  weeklySalesTrend,
  monthlySalesTrend,
  salesByCategory,
  salesByPaymentMethod,
  topSellingProducts,
  topCustomers,
  salesAlerts,
} from "@/lib/dummy-data/sales";

export const metadata: Metadata = {
  title: "Sales Dashboard — Supplier Management",
};

export default function SalesDashboardPage() {
  const today = salesTodayStats;
  const month = salesMonthStats;
  const avgOrderValue = getAverageOrderValue(month);

  const todayTiles = [
    { label: "Today's Sales", value: formatCurrency(today.todaySales), icon: <HiOutlineCurrencyRupee className="h-5 w-5" />, tone: "champagne" as const },
    { label: "Today's Orders", value: String(today.todayOrders), icon: <HiOutlineShoppingCart className="h-5 w-5" />, tone: "sky" as const },
    { label: "Today's Items Sold", value: String(today.todayItemsSold), icon: <HiOutlineCube className="h-5 w-5" />, tone: "emerald" as const },
    { label: "Pending Payments", value: formatCurrency(today.pendingPayments), icon: <HiOutlineBanknotes className="h-5 w-5" />, tone: "rose" as const },
    { label: "Returns", value: formatCurrency(today.returns), icon: <HiOutlineArrowUturnLeft className="h-5 w-5" />, tone: "rose" as const },
  ];

  const monthTiles = [
    { label: "This Month Sales", value: formatCurrencyCompact(month.monthSales), icon: <HiOutlineChartBar className="h-5 w-5" />, tone: "champagne" as const },
    { label: "This Month Orders", value: String(month.monthOrders), icon: <HiOutlineClipboardDocumentCheck className="h-5 w-5" />, tone: "sky" as const },
    { label: "Average Order Value", value: formatCurrency(avgOrderValue), icon: <HiOutlineReceiptPercent className="h-5 w-5" />, tone: "emerald" as const },
    { label: "Gross Profit", value: formatCurrencyCompact(month.grossProfit), icon: <HiOutlinePresentationChartBar className="h-5 w-5" />, tone: "emerald" as const },
  ];

  return (
    <div>
      <PageHeader title="Sales Dashboard" subtitle="The sales control center — today's performance, trends, and what needs attention." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {todayTiles.map((item) => (
          <StatTile key={item.label} label={item.label} value={item.value} icon={item.icon} tone={item.tone} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {monthTiles.map((item) => (
          <StatTile key={item.label} label={item.label} value={item.value} icon={item.icon} tone={item.tone} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h2 className="mb-1 text-base font-semibold text-ink">Sales Trend</h2>
          <SalesTrendChart daily={dailySalesTrend} weekly={weeklySalesTrend} monthly={monthlySalesTrend} />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-ink">Sales by Category</h2>
          <SalesSplitChart data={salesByCategory} />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-ink">Sales by Payment Method</h2>
          <SalesSplitChart data={salesByPaymentMethod} />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-ink">Top-Selling Products</h2>
          <TopProductsChart data={topSellingProducts} />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Top Customers</h2>
          <ul className="flex flex-col divide-y divide-glass-border">
            {topCustomers.map((customer) => (
              <li key={customer.name} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{customer.name}</p>
                  <p className="text-xs text-ink-muted">{customer.orders} orders</p>
                </div>
                <span className="text-sm font-semibold text-ink">{formatCurrency(customer.totalSpent)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Alerts</h2>
          <ul className="flex flex-col divide-y divide-glass-border">
            {salesAlerts.map((alert) => {
              const content = (
                <div className="flex items-center gap-3 py-3">
                  <Badge tone="warning" className="shrink-0 rounded-lg p-2">
                    <HiOutlineExclamationTriangle className="h-4 w-4" />
                  </Badge>
                  <span className="text-sm text-ink">{alert.message}</span>
                </div>
              );
              return (
                <li key={alert.id}>
                  {alert.href ? (
                    <Link href={alert.href} className="block transition-colors hover:text-champagne-700">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
