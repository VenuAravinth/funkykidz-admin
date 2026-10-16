"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlinePlus, HiOutlineEye, HiOutlinePencil } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { InvoiceActions } from "@/components/organisms/InvoiceActions";
import { formatCurrency, formatDate } from "@/lib/format";
import { invoiceGrandTotal, invoicePaymentLabel } from "@/lib/dummy-data/invoices";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import type { InvoiceStatus } from "@/types/invoice";

const STATUS_TABS: { label: string; value: InvoiceStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Issued", value: "issued" },
  { label: "Partially Paid", value: "partially_paid" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

function InvoicesListContent() {
  const searchParams = useSearchParams();
  const activeStatus = (searchParams.get("status") as InvoiceStatus | "all" | null) ?? "all";
  const allInvoices = useAppSelector(selectInvoices);

  const filtered = activeStatus === "all" ? allInvoices : allInvoices.filter((i) => i.status === activeStatus);

  const countFor = (value: InvoiceStatus | "all") =>
    value === "all" ? allInvoices.length : allInvoices.filter((i) => i.status === value).length;

  const tabs = STATUS_TABS.map((tab) => ({
    label: tab.label,
    href: `/sales/invoices?status=${tab.value}`,
    active: activeStatus === tab.value,
    count: countFor(tab.value),
  }));

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="The formal billing module."
        actions={
          <Link href="/sales/invoices/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        }
      />

      <div className="mb-5">
        <SegmentedTabs tabs={tabs} />
      </div>

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Invoice</Th>
            <Th>Customer</Th>
            <Th>Date</Th>
            <Th>Amount</Th>
            <Th>Payment</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={7} message="No invoices found." />}
          {filtered.map((i) => (
            <TableRow key={i.id}>
              <Td>
                <Link href={`/sales/invoices/${i.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {i.invoiceNumber}
                </Link>
              </Td>
              <Td>{i.customerName}</Td>
              <Td>{formatDate(i.createdDate)}</Td>
              <Td>{formatCurrency(invoiceGrandTotal(i))}</Td>
              <Td>
                <StatusBadge status={invoicePaymentLabel(i)} />
              </Td>
              <Td>
                <StatusBadge status={i.status} />
              </Td>
              <Td>
                <div className="flex items-center gap-1">
                  <Link href={`/sales/invoices/${i.id}`}>
                    <IconButton label="View" title="View">
                      <HiOutlineEye className="h-4 w-4" />
                    </IconButton>
                  </Link>
                  <Link href={`/sales/invoices/${i.id}/edit`}>
                    <IconButton label="Edit" title="Edit">
                      <HiOutlinePencil className="h-4 w-4" />
                    </IconButton>
                  </Link>
                  <InvoiceActions invoice={i} compact />
                </div>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function InvoicesListPage() {
  return (
    <Suspense fallback={null}>
      <InvoicesListContent />
    </Suspense>
  );
}
