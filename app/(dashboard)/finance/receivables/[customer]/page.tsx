"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { HiOutlineCreditCard, HiOutlineBanknotes, HiOutlineCheckCircle } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { StatTile } from "@/components/molecules/StatTile";
import { Button } from "@/components/atoms/Button";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getReceivablesRows } from "@/lib/finance";
import { resolveCustomerCreditLimit } from "@/lib/customers";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import { selectCustomerByName } from "@/stores/slices/customersSlice";

export default function ReceivableCustomerPage() {
  const { customer } = useParams<{ customer: string }>();
  const customerName = decodeURIComponent(customer);

  const invoices = useAppSelector(selectInvoices);
  const masterCustomer = useAppSelector((state) => selectCustomerByName(state, customerName));
  const rows = getReceivablesRows(invoices).filter((r) => r.customerName === customerName);

  const creditLimit = resolveCustomerCreditLimit(masterCustomer, customerName);
  const outstanding = rows.reduce((sum, r) => sum + r.outstanding, 0);
  const availableCredit = Math.max(creditLimit - outstanding, 0);

  return (
    <div>
      <PageHeader
        title={customerName}
        subtitle="Credit standing and outstanding invoices."
        backHref="/finance/receivables"
        backLabel="Back to Receivables"
        actions={
          <>
            <Link href={`/customers/${encodeURIComponent(customerName)}#ledger`}>
              <Button variant="secondary">View Ledger</Button>
            </Link>
            <Link href="/sales/invoices">
              <Button variant="secondary">View Invoices</Button>
            </Link>
            {rows[0] && (
              <Link href={`/sales/payments/new?invoiceId=${rows[0].invoiceId}`}>
                <Button>Receive Payment</Button>
              </Link>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile label="Credit Limit" value={formatCurrency(creditLimit)} icon={<HiOutlineCreditCard className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Outstanding" value={formatCurrency(outstanding)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="rose" />
        <StatTile label="Available Credit" value={formatCurrency(availableCredit)} icon={<HiOutlineCheckCircle className="h-5 w-5" />} tone="emerald" />
      </div>

      <Card className="mt-5 overflow-hidden p-0">
        <Table stickyActions>
          <TableHead>
            <TableRow>
              <Th>Invoice</Th>
              <Th>Total</Th>
              <Th>Paid</Th>
              <Th>Outstanding</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <TableEmpty colSpan={7} message="No outstanding invoices for this customer." />}
            {rows.map((row) => (
              <TableRow key={row.invoiceId}>
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
                <Td>
                  <Link href={`/sales/payments/new?invoiceId=${row.invoiceId}`}>
                    <Button variant="secondary" size="sm">
                      Receive Payment
                    </Button>
                  </Link>
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
