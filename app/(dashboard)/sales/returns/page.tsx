"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlinePlus, HiOutlineEye } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectReturns } from "@/stores/slices/returnsSlice";
import type { ReturnStatus } from "@/types/return";

const STATUS_TABS: { label: string; value: ReturnStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Refunded", value: "refunded" },
];

function ReturnsListContent() {
  const searchParams = useSearchParams();
  const activeStatus = (searchParams.get("status") as ReturnStatus | "all" | null) ?? "all";
  const returns = useAppSelector(selectReturns);

  const filtered = activeStatus === "all" ? returns : returns.filter((r) => r.status === activeStatus);
  const countFor = (value: ReturnStatus | "all") => (value === "all" ? returns.length : returns.filter((r) => r.status === value).length);

  const tabs = STATUS_TABS.map((tab) => ({
    label: tab.label,
    href: `/sales/returns?status=${tab.value}`,
    active: activeStatus === tab.value,
    count: countFor(tab.value),
  }));

  return (
    <div>
      <PageHeader
        title="Sales Returns"
        subtitle="Manages customer returns."
        actions={
          <Link href="/sales/returns/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Request Return
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
            <Th>Return</Th>
            <Th>Invoice</Th>
            <Th>Customer</Th>
            <Th>Amount</Th>
            <Th>Reason</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={7} message="No returns found." />}
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <Td>
                <Link href={`/sales/returns/${r.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {r.returnNumber}
                </Link>
              </Td>
              <Td>
                {r.invoiceId ? (
                  <Link href={`/sales/invoices/${r.invoiceId}`} className="hover:text-champagne-700">
                    {r.invoiceNumber}
                  </Link>
                ) : (
                  r.invoiceNumber
                )}
              </Td>
              <Td>{r.customerName}</Td>
              <Td>{formatCurrency(r.amount)}</Td>
              <Td>{r.reason}</Td>
              <Td>
                <StatusBadge status={r.status} />
              </Td>
              <Td>
                <Link href={`/sales/returns/${r.id}`}>
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

export default function ReturnsListPage() {
  return (
    <Suspense fallback={null}>
      <ReturnsListContent />
    </Suspense>
  );
}
