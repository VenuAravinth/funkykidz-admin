"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlinePlus, HiOutlineCalendarDays, HiOutlineChartBar, HiOutlineClock, HiOutlineArrowPath } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getExpenseDashboardStats } from "@/lib/dummy-data/finance";
import { useAppSelector } from "@/stores/hooks";
import { selectBankAccounts, selectExpenses } from "@/stores/slices/financeSlice";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/finance";

function ExpensesContent() {
  const searchParams = useSearchParams();
  const activeCategory = (searchParams.get("category") as ExpenseCategory | "all" | null) ?? "all";
  const expenses = useAppSelector(selectExpenses);
  const bankAccounts = useAppSelector(selectBankAccounts);
  const stats = getExpenseDashboardStats(expenses);

  const filtered = activeCategory === "all" ? expenses : expenses.filter((e) => e.category === activeCategory);
  const countFor = (value: ExpenseCategory | "all") => (value === "all" ? expenses.length : expenses.filter((e) => e.category === value).length);

  const tabs = [
    { label: "All", href: "/finance/expenses?category=all", active: activeCategory === "all", count: countFor("all") },
    ...EXPENSE_CATEGORIES.filter((c) => countFor(c) > 0).map((category) => ({
      label: category,
      href: `/finance/expenses?category=${encodeURIComponent(category)}`,
      active: activeCategory === category,
      count: countFor(category),
    })),
  ];

  const paidFromLabel = (paidFrom: string) => bankAccounts.find((a) => a.id === paidFrom)?.name ?? paidFrom;

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Every rupee that went out of the business."
        actions={
          <Link href="/finance/expenses/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <StatTile label="Today's Expenses" value={formatCurrency(stats.todayExpenses)} icon={<HiOutlineCalendarDays className="h-5 w-5" />} tone="rose" />
        <StatTile label="This Month" value={formatCurrency(stats.thisMonth)} icon={<HiOutlineChartBar className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Pending Expenses" value={formatCurrency(stats.pendingExpenses)} icon={<HiOutlineClock className="h-5 w-5" />} tone="sky" />
        <StatTile label="Recurring Expenses" value={formatCurrency(stats.recurringExpenses)} icon={<HiOutlineArrowPath className="h-5 w-5" />} tone="emerald" />
      </div>

      <div className="my-5">
        <SegmentedTabs tabs={tabs} />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Date</Th>
            <Th>Category</Th>
            <Th>Amount</Th>
            <Th>Method</Th>
            <Th>Paid From</Th>
            <Th>Description</Th>
            <Th>Status</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={7} message="No expenses recorded." />}
          {filtered.map((expense) => (
            <TableRow key={expense.id}>
              <Td>{formatDate(expense.date)}</Td>
              <Td>{expense.category}</Td>
              <Td className="font-medium text-ink">{formatCurrency(expense.amount)}</Td>
              <Td>{expense.method}</Td>
              <Td>{paidFromLabel(expense.paidFrom)}</Td>
              <Td className="max-w-xs truncate">{expense.description ?? "—"}</Td>
              <Td>
                <StatusBadge status={expense.status} />
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={null}>
      <ExpensesContent />
    </Suspense>
  );
}
