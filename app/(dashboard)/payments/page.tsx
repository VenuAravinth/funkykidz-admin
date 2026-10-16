import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { supplierPayments } from "@/lib/dummy-data/suppliers";

export const metadata: Metadata = {
  title: "Supplier Payments — Supplier Management",
};

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "pending" } = await searchParams;

  const filtered =
    status === "history"
      ? [...supplierPayments].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      : supplierPayments.filter((p) => p.status === status);

  const countFor = (s: string) => supplierPayments.filter((p) => p.status === s).length;

  const tabs = [
    { label: "Pending Payments", href: "/payments?status=pending", active: status === "pending", count: countFor("pending") },
    { label: "Paid", href: "/payments?status=paid", active: status === "paid", count: countFor("paid") },
    { label: "Partial Payment", href: "/payments?status=partial", active: status === "partial", count: countFor("partial") },
    { label: "Payment History", href: "/payments?status=history", active: status === "history", count: supplierPayments.length },
  ];

  return (
    <div>
      <PageHeader title="Supplier Payments" subtitle="Track invoices, balances, and settlement history." />

      <div className="mb-5">
        <SegmentedTabs tabs={tabs} />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Reference</Th>
            <Th>Supplier</Th>
            <Th>Invoice</Th>
            <Th>Due Date</Th>
            <Th>Status</Th>
            <Th>Amount</Th>
            <Th>Balance</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={7} message="No payments in this view." />}
          {filtered.map((p) => (
            <TableRow key={p.id}>
              <Td>
                <Link href={`/payments/${p.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {p.paymentRef}
                </Link>
              </Td>
              <Td>
                <Link href={`/suppliers/${p.supplierId}`} className="hover:text-champagne-700">
                  {p.supplierName}
                </Link>
              </Td>
              <Td>{p.invoiceNumber}</Td>
              <Td>{formatDate(p.dueDate)}</Td>
              <Td>
                <StatusBadge status={p.status} />
              </Td>
              <Td>{formatCurrency(p.amount)}</Td>
              <Td>{formatCurrency(p.amount - p.paidAmount)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
