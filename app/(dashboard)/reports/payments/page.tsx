"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { HiOutlineBanknotes, HiOutlineArrowUturnLeft, HiOutlineExclamationTriangle, HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { ComingSoon } from "@/components/molecules/ComingSoon";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { computePaymentReport } from "@/lib/salesReports";
import { computePaymentTransactions, computeRefunds, computePartialPayments, computeFailedPayments } from "@/lib/paymentReports";
import { useAppSelector } from "@/stores/hooks";
import { selectCustomerPayments } from "@/stores/slices/customerPaymentsSlice";
import { selectOnlineOrders } from "@/stores/slices/onlineOrdersSlice";

const TABS = [
  { label: "Payment Summary", value: "summary" },
  { label: "Transactions", value: "transactions" },
  { label: "Refunds", value: "refunds" },
  { label: "Partial Payments", value: "partial" },
  { label: "Failed Payments", value: "failed" },
  { label: "Reconciliation", value: "reconciliation" },
] as const;

type ReportType = (typeof TABS)[number]["value"];

function PaymentReportsContent() {
  const searchParams = useSearchParams();
  const activeType = (searchParams.get("type") as ReportType | null) ?? "summary";

  const payments = useAppSelector(selectCustomerPayments);
  const onlineOrders = useAppSelector(selectOnlineOrders);

  const methodRows = useMemo(() => computePaymentReport(payments), [payments]);
  const totalCollected = useMemo(() => methodRows.reduce((sum, r) => sum + r.amount, 0), [methodRows]);
  const transactions = useMemo(() => computePaymentTransactions(payments), [payments]);
  const refunds = useMemo(() => computeRefunds(payments), [payments]);
  const partial = useMemo(() => computePartialPayments(payments), [payments]);
  const failed = useMemo(() => computeFailedPayments(onlineOrders), [onlineOrders]);

  const tabs = TABS.map((t) => ({ label: t.label, href: `/reports/payments?type=${t.value}`, active: activeType === t.value }));

  return (
    <div>
      <PageHeader title="Payment Reports" subtitle="How much money was actually collected and through which method." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile label="Total Collected" value={formatCurrency(totalCollected)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Refunds" value={String(refunds.length)} icon={<HiOutlineArrowUturnLeft className="h-5 w-5" />} tone="rose" />
        <StatTile label="Failed Payments" value={String(failed.length)} icon={<HiOutlineExclamationTriangle className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="mb-6">
        <SegmentedTabs tabs={tabs} />
      </div>

      {activeType === "summary" && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {methodRows.map((r) => (
            <StatTile key={r.method} label={r.method} value={formatCurrency(r.amount)} hint={`${r.count} payment${r.count === 1 ? "" : "s"}`} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="sky" />
          ))}
        </div>
      )}

      {activeType === "transactions" && (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Date</Th>
              <Th>Invoice</Th>
              <Th>Customer</Th>
              <Th>Method</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 && <TableEmpty colSpan={6} message="No payment transactions recorded." />}
            {transactions.map((t, i) => (
              <TableRow key={i}>
                <Td>{formatDate(t.date)}</Td>
                <Td>
                  <Link href={`/sales/invoices`} className="font-medium text-ink hover:text-champagne-700">
                    {t.invoiceNumber}
                  </Link>
                </Td>
                <Td>{t.customerName}</Td>
                <Td>{t.method}</Td>
                <Td className="font-medium">{formatCurrency(t.amount)}</Td>
                <Td>
                  <StatusBadge status={t.status} />
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {activeType === "refunds" && (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Date</Th>
              <Th>Invoice</Th>
              <Th>Customer</Th>
              <Th>Method</Th>
              <Th>Amount</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {refunds.length === 0 && <TableEmpty colSpan={5} message="No refunds recorded." />}
            {refunds.map((p) => (
              <TableRow key={p.id}>
                <Td>{formatDate(p.date)}</Td>
                <Td className="font-medium text-ink">{p.invoiceNumber}</Td>
                <Td>{p.customerName}</Td>
                <Td>{p.method}</Td>
                <Td className="text-red-600">{formatCurrency(p.amount)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {activeType === "partial" && (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Date</Th>
              <Th>Invoice</Th>
              <Th>Customer</Th>
              <Th>Method</Th>
              <Th>Amount</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {partial.length === 0 && <TableEmpty colSpan={5} message="No partial payments recorded." />}
            {partial.map((p) => (
              <TableRow key={p.id}>
                <Td>{formatDate(p.date)}</Td>
                <Td className="font-medium text-ink">{p.invoiceNumber}</Td>
                <Td>{p.customerName}</Td>
                <Td>{p.method}</Td>
                <Td>{formatCurrency(p.amount)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {activeType === "failed" && (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Date</Th>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Method</Th>
              <Th>Amount</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {failed.length === 0 && <TableEmpty colSpan={5} message="No failed payments recorded." />}
            {failed.map((f) => (
              <TableRow key={f.orderNumber}>
                <Td>{formatDate(f.date)}</Td>
                <Td className="font-medium text-ink">{f.orderNumber}</Td>
                <Td>{f.customerName}</Td>
                <Td>{f.method}</Td>
                <Td className="text-red-600">{formatCurrency(f.amount)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {activeType === "reconciliation" && (
        <ComingSoon icon={HiOutlineClipboardDocumentCheck} message="Bank statement reconciliation isn't tracked as its own record yet." />
      )}
    </div>
  );
}

export default function PaymentReportsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentReportsContent />
    </Suspense>
  );
}
