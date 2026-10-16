import type { Metadata } from "next";
import Link from "next/link";
import {
  HiOutlineBuildingStorefront,
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/atoms/Table";
import { StatusSwitch } from "@/components/molecules/StatusSwitch";
import { formatCurrency, timeAgo } from "@/lib/format";
import { getDashboardStats, getRecentActivity, suppliers } from "@/lib/dummy-data/suppliers";

export const metadata: Metadata = {
  title: "Dashboard — Supplier Management",
};

export default function DashboardPage() {
  const stats = getDashboardStats();
  const activity = getRecentActivity(8);
  const topOutstanding = [...suppliers].sort((a, b) => b.outstandingAmount - a.outstandingAmount).slice(0, 5);
  const KPICards = [
    {
      label: "Total Suppliers",
      value: String(stats.totalSuppliers),
      icon: <HiOutlineBuildingStorefront className="h-5 w-5" />,
      hint: `${stats.activeSuppliers} active`,
      tone: "champagne"
    },
    {
      label: "Active Suppliers",
      value: String(stats.activeSuppliers),
      icon: <HiOutlineCheckCircle className="h-5 w-5" />,
      hint: `${stats.totalSuppliers - stats.activeSuppliers} inactive`,
      tone: "emerald"
    },
    {
      label: "Outstanding Payments",
      value: formatCurrency(stats.outstandingPayments),
      icon: <HiOutlineBanknotes className="h-5 w-5" />,
      hint: `Across all suppliers`,
      tone: "rose"
    },
    {
      label: "Total Purchases",
      value: formatCurrency(stats.totalPurchases),
      icon: <HiOutlineShoppingBag className="h-5 w-5" />,
      hint: `Lifetime, all suppliers`,
      tone: "sky"
    },
  ]
  return (
    <div>
      <PageHeader title="Supplier Dashboard" subtitle="Overview of suppliers, purchases, and outstanding payments." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPICards.map((item) => (
          <StatTile
           key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            hint={item.hint}
            tone={item?.tone || "sky"}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Recent Supplier Activity</h2>
            <Link href="/reports?type=ledger" className="text-sm font-medium text-champagne-600 hover:text-champagne-700">
              View ledger
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-glass-border">
            {activity.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-champagne-500" />
                  <div>
                    <p className="text-sm text-ink">{item.message}</p>
                    <p className="text-xs text-ink-muted">{item.supplierName}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-ink-muted">{timeAgo(item.timestamp)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Top Outstanding Balances</h2>
          </div>
          <ul className="flex flex-col divide-y divide-glass-border">
            {topOutstanding.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <Link href={`/suppliers/${s.id}`} className="text-sm font-medium text-ink hover:text-champagne-700">
                    {s.name}
                  </Link>
                  <p className="text-xs text-ink-muted">{s.code}</p>
                </div>
                <span className="text-sm font-semibold text-ink">{formatCurrency(s.outstandingAmount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Suppliers Overview</h2>
          <Link href="/suppliers" className="text-sm font-medium text-champagne-600 hover:text-champagne-700">
            View all suppliers
          </Link>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Supplier</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Rating</Th>
              <Th>Total Purchases</Th>
              <Th>Outstanding</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.slice(0, 6).map((s) => (
              <TableRow key={s.id}>
                <Td>
                  <Link href={`/suppliers/${s.id}`} className="font-medium text-ink hover:text-champagne-700">
                    {s.name}
                  </Link>
                  <div className="text-xs text-ink-muted">{s.code}</div>
                </Td>
                <Td>{s.category}</Td>
                <Td>
                  <StatusSwitch active={s.status === "active"} name={s.name} />
                </Td>
                <Td>{s.rating.toFixed(1)} / 5</Td>
                <Td>{formatCurrency(s.totalPurchases)}</Td>
                <Td>{formatCurrency(s.outstandingAmount)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
