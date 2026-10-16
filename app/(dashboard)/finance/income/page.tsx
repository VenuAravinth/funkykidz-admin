"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlinePlus, HiOutlineCurrencyRupee, HiOutlineShoppingBag, HiOutlineSparkles, HiOutlineBanknotes, HiOutlineCreditCard } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getIncomeDashboardStats } from "@/lib/dummy-data/finance";
import { useAppSelector } from "@/stores/hooks";
import { selectIncome } from "@/stores/slices/financeSlice";
import { INCOME_CATEGORIES, type IncomeCategory } from "@/types/finance";

function IncomeContent() {
  const searchParams = useSearchParams();
  const activeCategory = (searchParams.get("category") as IncomeCategory | "all" | null) ?? "all";
  const income = useAppSelector(selectIncome);
  const stats = getIncomeDashboardStats(income);

  const filtered = activeCategory === "all" ? income : income.filter((i) => i.category === activeCategory);
  const countFor = (value: IncomeCategory | "all") => (value === "all" ? income.length : income.filter((i) => i.category === value).length);

  const tabs = [
    { label: "All", href: "/finance/income?category=all", active: activeCategory === "all", count: countFor("all") },
    ...INCOME_CATEGORIES.map((category) => ({
      label: category,
      href: `/finance/income?category=${encodeURIComponent(category)}`,
      active: activeCategory === category,
      count: countFor(category),
    })),
  ];

  return (
    <div>
      <PageHeader
        title="Income"
        subtitle="Every rupee that came into the business."
        actions={
          <Link href="/finance/income/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Add Income
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Total Income" value={formatCurrency(stats.totalIncome)} icon={<HiOutlineCurrencyRupee className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Sales Income" value={formatCurrency(stats.salesIncome)} icon={<HiOutlineShoppingBag className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Other Income" value={formatCurrency(stats.otherIncome)} icon={<HiOutlineSparkles className="h-5 w-5" />} tone="sky" />
        <StatTile label="Cash Received" value={formatCurrency(stats.cashReceived)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="rose" />
        <StatTile label="Bank/UPI Received" value={formatCurrency(stats.bankUpiReceived)} icon={<HiOutlineCreditCard className="h-5 w-5" />} tone="sky" />
      </div>

      <Card className="my-5 p-4 text-sm text-ink-muted">
        Sales revenue and actual payment received are not always the same — this page tracks money that has actually come in, not what&apos;s invoiced.
      </Card>

      <div className="mb-5">
        <SegmentedTabs tabs={tabs} />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Date</Th>
            <Th>Reference</Th>
            <Th>Source</Th>
            <Th>Category</Th>
            <Th>Method</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={7} message="No income recorded." />}
          {filtered.map((entry) => (
            <TableRow key={entry.id}>
              <Td>{formatDate(entry.date)}</Td>
              <Td>{entry.reference}</Td>
              <Td>{entry.source}</Td>
              <Td>{entry.category}</Td>
              <Td>{entry.method}</Td>
              <Td className="font-medium text-ink">{formatCurrency(entry.amount)}</Td>
              <Td>
                <StatusBadge status={entry.status} />
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function IncomePage() {
  return (
    <Suspense fallback={null}>
      <IncomeContent />
    </Suspense>
  );
}
