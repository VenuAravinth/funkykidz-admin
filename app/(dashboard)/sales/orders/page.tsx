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
import { SalesOrderActions } from "@/components/organisms/SalesOrderActions";
import { formatCurrency, formatDate } from "@/lib/format";
import { salesOrderTotal } from "@/lib/dummy-data/salesOrders";
import { useAppSelector } from "@/stores/hooks";
import { selectSalesOrders } from "@/stores/slices/salesOrdersSlice";
import type { OrderStatus } from "@/types/salesOrder";

const STATUS_TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Ready", value: "ready" },
  { label: "Partially Fulfilled", value: "partially_fulfilled" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function SalesOrdersListContent() {
  const searchParams = useSearchParams();
  const activeStatus = (searchParams.get("status") as OrderStatus | "all" | null) ?? "all";
  const allOrders = useAppSelector(selectSalesOrders);

  const filtered = activeStatus === "all" ? allOrders : allOrders.filter((o) => o.status === activeStatus);

  const countFor = (value: OrderStatus | "all") =>
    value === "all" ? allOrders.length : allOrders.filter((o) => o.status === value).length;

  const tabs = STATUS_TABS.map((tab) => ({
    label: tab.label,
    href: `/sales/orders?status=${tab.value}`,
    active: activeStatus === tab.value,
    count: countFor(tab.value),
  }));

  return (
    <div>
      <PageHeader
        title="Sales Orders"
        subtitle="Confirmed customer orders, from acceptance through fulfillment."
        actions={
          <Link href="/sales/orders/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Create Sales Order
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
            <Th>SO No</Th>
            <Th>Customer</Th>
            <Th>Date</Th>
            <Th>Amount</Th>
            <Th>Fulfillment</Th>
            <Th>Payment</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={8} message="No sales orders found." />}
          {filtered.map((o) => (
            <TableRow key={o.id}>
              <Td>
                <Link href={`/sales/orders/${o.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {o.soNumber}
                </Link>
              </Td>
              <Td>{o.customerName}</Td>
              <Td>{formatDate(o.createdDate)}</Td>
              <Td>{formatCurrency(salesOrderTotal(o))}</Td>
              <Td>
                <StatusBadge status={o.fulfillmentStatus} />
              </Td>
              <Td>
                <StatusBadge status={o.paymentStatus} />
              </Td>
              <Td>
                <StatusBadge status={o.status} />
              </Td>
              <Td>
                <div className="flex items-center gap-1">
                  <Link href={`/sales/orders/${o.id}`}>
                    <IconButton label="View" title="View">
                      <HiOutlineEye className="h-4 w-4" />
                    </IconButton>
                  </Link>
                  <Link href={`/sales/orders/${o.id}/edit`}>
                    <IconButton label="Edit" title="Edit">
                      <HiOutlinePencil className="h-4 w-4" />
                    </IconButton>
                  </Link>
                  <SalesOrderActions order={o} compact />
                </div>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function SalesOrdersListPage() {
  return (
    <Suspense fallback={null}>
      <SalesOrdersListContent />
    </Suspense>
  );
}
