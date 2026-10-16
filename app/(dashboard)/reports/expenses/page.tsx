"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineTag,
  HiOutlineClock,
  HiOutlineBuildingStorefront,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { ComingSoon } from "@/components/molecules/ComingSoon";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { BreakdownBarChart } from "@/components/organisms/charts/BreakdownBarChart";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  computeExpenseSummary,
  computeExpenseByDay,
  computeExpenseByMonth,
  computeExpenseByCategory,
  computeExpenseByMethod,
  computeRecurringExpenses,
} from "@/lib/expenseReports";
import { useAppSelector } from "@/stores/hooks";
import { selectExpenses } from "@/stores/slices/financeSlice";
import type { Expense } from "@/types/finance";

const TABS = [
  { label: "Daily Expense", value: "daily" },
  { label: "Monthly Expense", value: "monthly" },
  { label: "Category-wise", value: "category" },
  { label: "Payment Method", value: "method" },
  { label: "Recurring Expenses", value: "recurring" },
  { label: "Vendor-wise", value: "vendor" },
] as const;

type ReportType = (typeof TABS)[number]["value"];

function DailyExpenseSection({ expenses }: { expenses: Expense[] }) {
  const rows = computeExpenseByDay(expenses);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Date</Th>
          <Th>Amount</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={2} message="No expenses recorded." />}
        {rows.map((r) => (
          <TableRow key={r.date}>
            <Td>{formatDate(r.date)}</Td>
            <Td className="font-medium text-red-600">{formatCurrency(r.amount)}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MonthlyExpenseSection({ expenses }: { expenses: Expense[] }) {
  const rows = computeExpenseByMonth(expenses);
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Expense Trend</h2>
        <BreakdownBarChart data={[...rows].reverse().map((r) => ({ name: r.date, value: r.amount }))} seriesName="Expenses" />
      </Card>
      <Table>
        <TableHead>
          <TableRow>
            <Th>Month</Th>
            <Th>Amount</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={2} message="No expenses recorded." />}
          {rows.map((r) => (
            <TableRow key={r.date}>
              <Td>{r.date}</Td>
              <Td className="font-medium text-red-600">{formatCurrency(r.amount)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CategoryExpenseSection({ expenses }: { expenses: Expense[] }) {
  const rows = computeExpenseByCategory(expenses);
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <BreakdownBarChart data={rows.map((r) => ({ name: r.category, value: r.amount }))} seriesName="Expenses" />
      </Card>
      <Table>
        <TableHead>
          <TableRow>
            <Th>Category</Th>
            <Th>Amount</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={2} message="No expenses recorded." />}
          {rows.map((r) => (
            <TableRow key={r.category}>
              <Td className="font-medium text-ink">{r.category}</Td>
              <Td className="text-red-600">{formatCurrency(r.amount)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MethodExpenseSection({ expenses }: { expenses: Expense[] }) {
  const rows = computeExpenseByMethod(expenses);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {rows.map((r) => (
        <StatTile key={r.method} label={r.method} value={formatCurrency(r.amount)} hint={`${r.count} expense${r.count === 1 ? "" : "s"}`} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="rose" />
      ))}
    </div>
  );
}

function RecurringExpenseSection({ expenses }: { expenses: Expense[] }) {
  const rows = computeRecurringExpenses(expenses);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Category</Th>
          <Th>Description</Th>
          <Th>Date</Th>
          <Th>Amount</Th>
          <Th>Status</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={5} message="No recurring expenses set up." />}
        {rows.map((e) => (
          <TableRow key={e.id}>
            <Td className="font-medium text-ink">{e.category}</Td>
            <Td>{e.description ?? "—"}</Td>
            <Td>{formatDate(e.date)}</Td>
            <Td className="text-red-600">{formatCurrency(e.amount)}</Td>
            <Td>
              <Badge tone={e.status === "paid" ? "success" : "warning"}>{e.status}</Badge>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ExpenseReportsContent() {
  const searchParams = useSearchParams();
  const activeType = (searchParams.get("type") as ReportType | null) ?? "daily";

  const expenses = useAppSelector(selectExpenses);
  const summary = useMemo(() => computeExpenseSummary(expenses), [expenses]);

  const tabs = TABS.map((t) => ({ label: t.label, href: `/reports/expenses?type=${t.value}`, active: activeType === t.value }));

  return (
    <div>
      <PageHeader title="Expense Reports" subtitle="Where the business is spending money." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="rose" />
        <StatTile label="This Month" value={formatCurrency(summary.thisMonth)} icon={<HiOutlineCalendarDays className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Largest Category" value={summary.largestCategory} icon={<HiOutlineTag className="h-5 w-5" />} tone="sky" />
        <StatTile label="Pending Expenses" value={formatCurrency(summary.pendingExpenses)} icon={<HiOutlineClock className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="mb-6">
        <SegmentedTabs tabs={tabs} />
      </div>

      {activeType === "daily" && <DailyExpenseSection expenses={expenses} />}
      {activeType === "monthly" && <MonthlyExpenseSection expenses={expenses} />}
      {activeType === "category" && <CategoryExpenseSection expenses={expenses} />}
      {activeType === "method" && <MethodExpenseSection expenses={expenses} />}
      {activeType === "recurring" && <RecurringExpenseSection expenses={expenses} />}
      {activeType === "vendor" && (
        <ComingSoon icon={HiOutlineBuildingStorefront} message="Expenses aren't linked to a vendor record yet — only a free-text description." />
      )}
    </div>
  );
}

export default function ExpenseReportsPage() {
  return (
    <Suspense fallback={null}>
      <ExpenseReportsContent />
    </Suspense>
  );
}
