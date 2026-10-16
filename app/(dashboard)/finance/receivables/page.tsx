"use client";

import Link from "next/link";
import { HiOutlineBanknotes, HiOutlineCalendarDays, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getReceivablesDashboardStats, getReceivablesRows } from "@/lib/finance";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoices } from "@/stores/slices/invoicesSlice";

export default function ReceivablesPage() {
  const invoices = useAppSelector(selectInvoices);
  const rows = getReceivablesRows(invoices);
  const stats = getReceivablesDashboardStats(invoices);

  return (
    <div>
      <PageHeader title="Customer Receivables" subtitle="How much money customers owe Funky Kids." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile label="Total Outstanding" value={formatCurrency(stats.totalOutstanding)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Due Today" value={formatCurrency(stats.dueToday)} icon={<HiOutlineCalendarDays className="h-5 w-5" />} tone="sky" />
        <StatTile label="Overdue" value={formatCurrency(stats.overdue)} icon={<HiOutlineExclamationTriangle className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="mt-5">
        <Table>
          <TableHead>
            <TableRow>
              <Th>Customer</Th>
              <Th>Invoice</Th>
              <Th>Total</Th>
              <Th>Paid</Th>
              <Th>Outstanding</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <TableEmpty colSpan={7} message="No outstanding customer balances." />}
            {rows.map((row) => (
              <TableRow key={row.invoiceId}>
                <Td>
                  <Link href={`/finance/receivables/${encodeURIComponent(row.customerName)}`} className="font-medium text-ink hover:text-champagne-700">
                    {row.customerName}
                  </Link>
                </Td>
                <Td>
                  <Link href={`/sales/invoices/${row.invoiceId}`} className="hover:text-champagne-700">
                    {row.invoiceNumber}
                  </Link>
                </Td>
                <Td>{formatCurrency(row.total)}</Td>
                <Td>{formatCurrency(row.paid)}</Td>
                <Td className="font-semibold text-red-600">{formatCurrency(row.outstanding)}</Td>
                <Td>{formatDate(row.dueDate)}</Td>
                <Td>
                  <StatusBadge status={row.status} />
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
