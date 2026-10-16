import type { Metadata } from "next";
import Link from "next/link";
import { HiOutlineBanknotes, HiOutlineCalendarDays, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPayablesDashboardStats, getPayablesRows } from "@/lib/finance";

export const metadata: Metadata = {
  title: "Supplier Payables — Finance",
};

export default function PayablesPage() {
  const rows = getPayablesRows();
  const stats = getPayablesDashboardStats();

  return (
    <div>
      <PageHeader title="Supplier Payables" subtitle="How much money Funky Kids owes its suppliers." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile label="Total Payable" value={formatCurrency(stats.totalPayable)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Due Today" value={formatCurrency(stats.dueToday)} icon={<HiOutlineCalendarDays className="h-5 w-5" />} tone="sky" />
        <StatTile label="Overdue" value={formatCurrency(stats.overdue)} icon={<HiOutlineExclamationTriangle className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="mt-5">
        <Table>
          <TableHead>
            <TableRow>
              <Th>Supplier</Th>
              <Th>Invoice</Th>
              <Th>Amount</Th>
              <Th>Paid</Th>
              <Th>Outstanding</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <TableEmpty colSpan={7} message="No outstanding supplier balances." />}
            {rows.map((row) => (
              <TableRow key={row.paymentId}>
                <Td>
                  <Link href={`/suppliers/${row.supplierId}`} className="font-medium text-ink hover:text-champagne-700">
                    {row.supplierName}
                  </Link>
                </Td>
                <Td>{row.invoiceNumber}</Td>
                <Td>{formatCurrency(row.amount)}</Td>
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
