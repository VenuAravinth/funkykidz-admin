"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { Badge } from "@/components/atoms/Badge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectFinanceLedger } from "@/stores/slices/financeSlice";
import type { FinanceTransactionType } from "@/types/finance";

const TYPE_LABELS: Record<FinanceTransactionType, string> = {
  income: "Income",
  expense: "Expense",
  receivable_payment: "Receivable",
  payable_payment: "Payable",
  cash_movement: "Cash",
};

const TYPE_TABS: { label: string; value: FinanceTransactionType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
  { label: "Receivables", value: "receivable_payment" },
  { label: "Payables", value: "payable_payment" },
  { label: "Cash", value: "cash_movement" },
];

function TransactionsContent() {
  const searchParams = useSearchParams();
  const activeType = (searchParams.get("type") as FinanceTransactionType | "all" | null) ?? "all";
  const ledger = useAppSelector(selectFinanceLedger);

  const filtered = activeType === "all" ? ledger : ledger.filter((t) => t.type === activeType);
  const countFor = (value: FinanceTransactionType | "all") => (value === "all" ? ledger.length : ledger.filter((t) => t.type === value).length);

  const tabs = TYPE_TABS.map((tab) => ({
    label: tab.label,
    href: `/finance/transactions?type=${tab.value}`,
    active: activeType === tab.value,
    count: countFor(tab.value),
  }));

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Every income, expense, and payment, in one ledger." />

      <div className="mb-5">
        <SegmentedTabs tabs={tabs} />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Reference</Th>
            <Th>Description</Th>
            <Th>Method</Th>
            <Th>Amount</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={6} message="No transactions recorded yet." />}
          {filtered.map((txn) => (
            <TableRow key={txn.id}>
              <Td>{formatDate(txn.date)}</Td>
              <Td>
                <Badge tone={txn.direction === "in" ? "success" : "danger"}>{TYPE_LABELS[txn.type]}</Badge>
              </Td>
              <Td>{txn.reference}</Td>
              <Td className="max-w-sm truncate">{txn.description}</Td>
              <Td>{txn.method}</Td>
              <Td className={txn.direction === "in" ? "font-medium text-emerald-600" : "font-medium text-red-600"}>
                {txn.direction === "in" ? "+" : "-"}
                {formatCurrency(txn.amount)}
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsContent />
    </Suspense>
  );
}
