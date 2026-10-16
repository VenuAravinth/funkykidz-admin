"use client";

import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiOutlineScale } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { IncomeVsExpenseChart } from "@/components/organisms/charts/IncomeVsExpenseChart";
import { formatCurrency } from "@/lib/format";
import { getProfitAndLoss } from "@/lib/finance";
import { useAppSelector } from "@/stores/hooks";
import { selectExpenses, selectIncome } from "@/stores/slices/financeSlice";

export default function ProfitLossPage() {
  const income = useAppSelector(selectIncome);
  const expenses = useAppSelector(selectExpenses);
  const pnl = getProfitAndLoss(income, expenses);

  return (
    <div>
      <PageHeader title="Profit & Loss" subtitle="Total income versus total expenses, and what's left over." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile label="Total Income" value={formatCurrency(pnl.totalIncome)} icon={<HiOutlineArrowTrendingUp className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Total Expenses" value={formatCurrency(pnl.totalExpenses)} icon={<HiOutlineArrowTrendingDown className="h-5 w-5" />} tone="rose" />
        <StatTile
          label="Net Profit"
          value={formatCurrency(pnl.netProfit)}
          icon={<HiOutlineScale className="h-5 w-5" />}
          tone={pnl.netProfit >= 0 ? "champagne" : "rose"}
        />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="mb-1 text-base font-semibold text-ink">Income vs Expense by Category</h2>
        <IncomeVsExpenseChart incomeByCategory={pnl.incomeByCategory} expenseByCategory={pnl.expenseByCategory} />
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-muted">Income by Category</h2>
          <Table>
            <TableHead>
              <TableRow>
                <Th>Category</Th>
                <Th>Amount</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {pnl.incomeByCategory.length === 0 && <TableEmpty colSpan={2} message="No income recorded." />}
              {pnl.incomeByCategory.map((row) => (
                <TableRow key={row.category}>
                  <Td>{row.category}</Td>
                  <Td className="font-medium text-emerald-600">{formatCurrency(row.amount)}</Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-muted">Expenses by Category</h2>
          <Table>
            <TableHead>
              <TableRow>
                <Th>Category</Th>
                <Th>Amount</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {pnl.expenseByCategory.length === 0 && <TableEmpty colSpan={2} message="No expenses recorded." />}
              {pnl.expenseByCategory.map((row) => (
                <TableRow key={row.category}>
                  <Td>{row.category}</Td>
                  <Td className="font-medium text-red-600">{formatCurrency(row.amount)}</Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
