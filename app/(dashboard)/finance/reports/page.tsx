"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPayablesRows, getProfitAndLoss, getReceivablesRows } from "@/lib/finance";
import { useAppSelector } from "@/stores/hooks";
import { selectExpenses, selectIncome } from "@/stores/slices/financeSlice";
import { selectInvoices } from "@/stores/slices/invoicesSlice";

type ReportType = "income" | "expense" | "receivables-aging" | "payables-aging";

function IncomeSummaryReport() {
  const income = useAppSelector(selectIncome);
  const pnl = getProfitAndLoss(income, []);
  return (
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
  );
}

function ExpenseSummaryReport() {
  const expenses = useAppSelector(selectExpenses);
  const pnl = getProfitAndLoss([], expenses);
  return (
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
  );
}

function ReceivablesAgingReport() {
  const invoices = useAppSelector(selectInvoices);
  const rows = getReceivablesRows(invoices);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Customer</Th>
          <Th>Invoice</Th>
          <Th>Outstanding</Th>
          <Th>Due Date</Th>
          <Th>Status</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={5} message="No outstanding receivables." />}
        {rows.map((row) => (
          <TableRow key={row.invoiceId}>
            <Td>{row.customerName}</Td>
            <Td>{row.invoiceNumber}</Td>
            <Td className="font-medium text-red-600">{formatCurrency(row.outstanding)}</Td>
            <Td>{formatDate(row.dueDate)}</Td>
            <Td>
              <StatusBadge status={row.status} />
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PayablesAgingReport() {
  const rows = getPayablesRows();
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Supplier</Th>
          <Th>Invoice</Th>
          <Th>Outstanding</Th>
          <Th>Due Date</Th>
          <Th>Status</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={5} message="No outstanding payables." />}
        {rows.map((row) => (
          <TableRow key={row.paymentId}>
            <Td>{row.supplierName}</Td>
            <Td>{row.invoiceNumber}</Td>
            <Td className="font-medium text-red-600">{formatCurrency(row.outstanding)}</Td>
            <Td>{formatDate(row.dueDate)}</Td>
            <Td>
              <StatusBadge status={row.status} />
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function FinancialReportsContent() {
  const searchParams = useSearchParams();
  const activeType = (searchParams.get("type") as ReportType | null) ?? "income";

  const tabs = [
    { label: "Income Summary", href: "/finance/reports?type=income", active: activeType === "income" },
    { label: "Expense Summary", href: "/finance/reports?type=expense", active: activeType === "expense" },
    { label: "Receivables Aging", href: "/finance/reports?type=receivables-aging", active: activeType === "receivables-aging" },
    { label: "Payables Aging", href: "/finance/reports?type=payables-aging", active: activeType === "payables-aging" },
  ];

  return (
    <div>
      <PageHeader title="Financial Reports" subtitle="Income, expense, and aging reports for the business." />

      <div className="mb-6">
        <SegmentedTabs tabs={tabs} />
      </div>

      {activeType === "income" && <IncomeSummaryReport />}
      {activeType === "expense" && <ExpenseSummaryReport />}
      {activeType === "receivables-aging" && <ReceivablesAgingReport />}
      {activeType === "payables-aging" && <PayablesAgingReport />}
    </div>
  );
}

export default function FinancialReportsPage() {
  return (
    <Suspense fallback={null}>
      <FinancialReportsContent />
    </Suspense>
  );
}
