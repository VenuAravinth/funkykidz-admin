"use client";

import Link from "next/link";
import {
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineScale,
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineWallet,
  HiOutlineCurrencyRupee,
  HiOutlineReceiptPercent,
  HiOutlineUserGroup,
  HiOutlineBuildingStorefront,
  HiOutlineBuildingLibrary,
  HiOutlineArrowsRightLeft,
  HiOutlineChartBar,
  HiOutlineDocumentChartBar,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { IncomeVsExpenseChart } from "@/components/organisms/charts/IncomeVsExpenseChart";
import { formatCurrency } from "@/lib/format";
import { getPayablesDashboardStats, getProfitAndLoss, getReceivablesDashboardStats } from "@/lib/finance";
import { useAppSelector } from "@/stores/hooks";
import { selectCashBalance, selectExpenses, selectIncome } from "@/stores/slices/financeSlice";
import { selectInvoices } from "@/stores/slices/invoicesSlice";

const SECTIONS = [
  { label: "Income", href: "/finance/income", description: "Money coming into the business.", icon: HiOutlineCurrencyRupee },
  { label: "Expenses", href: "/finance/expenses", description: "Money going out of the business.", icon: HiOutlineReceiptPercent },
  { label: "Customer Receivables", href: "/finance/receivables", description: "What customers owe Funky Kids.", icon: HiOutlineUserGroup },
  { label: "Supplier Payables", href: "/finance/payables", description: "What Funky Kids owes suppliers.", icon: HiOutlineBuildingStorefront },
  { label: "Cash Management", href: "/finance/cash", description: "Cash in hand and till movements.", icon: HiOutlineWallet },
  { label: "Bank Accounts", href: "/finance/bank-accounts", description: "Balances across every account.", icon: HiOutlineBuildingLibrary },
  { label: "Transactions", href: "/finance/transactions", description: "The unified financial ledger.", icon: HiOutlineArrowsRightLeft },
  { label: "Profit & Loss", href: "/finance/profit-loss", description: "Income vs. expense, and net profit.", icon: HiOutlineChartBar },
  { label: "Financial Reports", href: "/finance/reports", description: "Income, expense, and aging reports.", icon: HiOutlineDocumentChartBar },
];

export default function FinanceDashboardPage() {
  const income = useAppSelector(selectIncome);
  const expenses = useAppSelector(selectExpenses);
  const invoices = useAppSelector(selectInvoices);
  const cashBalance = useAppSelector(selectCashBalance);

  const pnl = getProfitAndLoss(income, expenses);
  const receivables = getReceivablesDashboardStats(invoices);
  const payables = getPayablesDashboardStats();

  return (
    <div>
      <PageHeader title="Finance" subtitle="The financial control center — income, expenses, receivables, and cash flow." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile label="Total Income" value={formatCurrency(pnl.totalIncome)} icon={<HiOutlineArrowTrendingUp className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Total Expenses" value={formatCurrency(pnl.totalExpenses)} icon={<HiOutlineArrowTrendingDown className="h-5 w-5" />} tone="rose" />
        <StatTile
          label="Net Profit"
          value={formatCurrency(pnl.netProfit)}
          icon={<HiOutlineScale className="h-5 w-5" />}
          tone={pnl.netProfit >= 0 ? "champagne" : "rose"}
        />
        <StatTile label="Receivables Outstanding" value={formatCurrency(receivables.totalOutstanding)} icon={<HiOutlineCreditCard className="h-5 w-5" />} tone="sky" />
        <StatTile label="Payables Outstanding" value={formatCurrency(payables.totalPayable)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="sky" />
        <StatTile label="Cash in Hand" value={formatCurrency(cashBalance)} icon={<HiOutlineWallet className="h-5 w-5" />} tone="champagne" />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="mb-1 text-base font-semibold text-ink">Income vs Expense by Category</h2>
        <IncomeVsExpenseChart incomeByCategory={pnl.incomeByCategory} expenseByCategory={pnl.expenseByCategory} />
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="flex h-full items-start gap-3 p-5 transition-colors hover:bg-white/70">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne-100 text-champagne-600">
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{section.label}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{section.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
