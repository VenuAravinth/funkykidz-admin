"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlinePlus, HiOutlineEye, HiOutlineBanknotes, HiOutlineDevicePhoneMobile, HiOutlineCreditCard, HiOutlineClock } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate, addDays } from "@/lib/format";
import { invoiceGrandTotal } from "@/lib/dummy-data/invoices";
import { useAppSelector } from "@/stores/hooks";
import { selectCustomerPayments } from "@/stores/slices/customerPaymentsSlice";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import type { PaymentStatus } from "@/types/payment";

const TODAYS_COLLECTION = { total: 42_850, cash: 12_500, upi: 18_350, card: 10_000, credit: 2_000 };

const STATUS_TABS: { label: string; value: PaymentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Refunded", value: "refunded" },
  { label: "Reversed", value: "reversed" },
];

const NOT_OUTSTANDING_STATUSES = new Set(["draft", "cancelled", "refunded"]);

function PaymentsListView() {
  const searchParams = useSearchParams();
  const activeStatus = (searchParams.get("status") as PaymentStatus | "all" | null) ?? "all";
  const payments = useAppSelector(selectCustomerPayments);

  const filtered = activeStatus === "all" ? payments : payments.filter((p) => p.status === activeStatus);
  const countFor = (value: PaymentStatus | "all") => (value === "all" ? payments.length : payments.filter((p) => p.status === value).length);

  const tabs = STATUS_TABS.map((tab) => ({
    label: tab.label,
    href: `/sales/payments?view=payments&status=${tab.value}`,
    active: activeStatus === tab.value,
    count: countFor(tab.value),
  }));

  return (
    <div>
      <div className="mb-5">
        <SegmentedTabs tabs={tabs} />
      </div>
      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Date</Th>
            <Th>Invoice</Th>
            <Th>Customer</Th>
            <Th>Method</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={7} message="No payments found." />}
          {filtered.map((p) => (
            <TableRow key={p.id}>
              <Td>{formatDate(p.date)}</Td>
              <Td>
                {p.invoiceId ? (
                  <Link href={`/sales/invoices/${p.invoiceId}`} className="hover:text-champagne-700">
                    {p.invoiceNumber}
                  </Link>
                ) : (
                  p.invoiceNumber
                )}
              </Td>
              <Td>{p.customerName}</Td>
              <Td>{p.method}</Td>
              <Td>{formatCurrency(p.amount)}</Td>
              <Td>
                <StatusBadge status={p.status} />
              </Td>
              <Td>
                <Link href={`/sales/payments/${p.id}`}>
                  <IconButton label="View">
                    <HiOutlineEye className="h-4 w-4" />
                  </IconButton>
                </Link>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CustomerOutstandingView() {
  const invoices = useAppSelector(selectInvoices);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const byCustomer = new Map<string, { customerName: string; total: number; paid: number; nearestDue: string; invoiceCount: number }>();
    for (const inv of invoices) {
      if (NOT_OUTSTANDING_STATUSES.has(inv.status)) continue;
      const total = invoiceGrandTotal(inv);
      const outstanding = total - inv.paidAmount;
      if (outstanding <= 0) continue;
      const due = addDays(inv.createdDate, 15);
      const existing = byCustomer.get(inv.customerName);
      if (existing) {
        existing.total += total;
        existing.paid += inv.paidAmount;
        existing.invoiceCount += 1;
        if (due < existing.nearestDue) existing.nearestDue = due;
      } else {
        byCustomer.set(inv.customerName, { customerName: inv.customerName, total, paid: inv.paidAmount, nearestDue: due, invoiceCount: 1 });
      }
    }
    return [...byCustomer.values()]
      .filter((r) => r.customerName.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => b.total - b.paid - (a.total - a.paid));
  }, [invoices, query]);

  return (
    <div>
      <div className="mb-5">
        <SearchInput placeholder="Search by customer…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search customers" />
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <Th>Customer</Th>
            <Th>Invoices</Th>
            <Th>Invoice Total</Th>
            <Th>Paid</Th>
            <Th>Outstanding</Th>
            <Th>Due Date</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={6} message="No customers have an outstanding balance." />}
          {rows.map((r) => (
            <TableRow key={r.customerName}>
              <Td className="font-medium text-ink">{r.customerName}</Td>
              <Td>{r.invoiceCount}</Td>
              <Td>{formatCurrency(r.total)}</Td>
              <Td>{formatCurrency(r.paid)}</Td>
              <Td className="font-semibold text-red-600">{formatCurrency(r.total - r.paid)}</Td>
              <Td>{formatDate(r.nearestDue)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "outstanding" ? "outstanding" : "payments";

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Track money received from customers."
        actions={
          <Link href="/sales/payments/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Record Payment
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Today's Collection" value={formatCurrency(TODAYS_COLLECTION.total)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Cash" value={formatCurrency(TODAYS_COLLECTION.cash)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="emerald" />
        <StatTile label="UPI" value={formatCurrency(TODAYS_COLLECTION.upi)} icon={<HiOutlineDevicePhoneMobile className="h-5 w-5" />} tone="sky" />
        <StatTile label="Card" value={formatCurrency(TODAYS_COLLECTION.card)} icon={<HiOutlineCreditCard className="h-5 w-5" />} tone="sky" />
        <StatTile label="Credit" value={formatCurrency(TODAYS_COLLECTION.credit)} icon={<HiOutlineClock className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="my-5">
        <SegmentedTabs
          tabs={[
            { label: "Payments", href: "/sales/payments?view=payments", active: view === "payments" },
            { label: "Customer Outstanding", href: "/sales/payments?view=outstanding", active: view === "outstanding" },
          ]}
        />
      </div>

      {view === "payments" ? <PaymentsListView /> : <CustomerOutstandingView />}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentsContent />
    </Suspense>
  );
}
