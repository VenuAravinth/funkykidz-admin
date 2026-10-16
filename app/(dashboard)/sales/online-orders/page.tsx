"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineInboxArrowDown,
  HiOutlineCog6Tooth,
  HiOutlineArchiveBoxArrowDown,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { onlineOrderTotal } from "@/lib/dummy-data/onlineOrders";
import { useAppSelector } from "@/stores/hooks";
import { selectOnlineOrders } from "@/stores/slices/onlineOrdersSlice";
import { ONLINE_ORDER_STATUSES, type OnlineOrderStatus } from "@/types/onlineOrder";

const STATUS_LABELS: Record<OnlineOrderStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
};

function OnlineOrdersContent() {
  const searchParams = useSearchParams();
  const activeStatus = (searchParams.get("status") as OnlineOrderStatus | "all" | null) ?? "all";
  const orders = useAppSelector(selectOnlineOrders);

  const countFor = (status: OnlineOrderStatus) => orders.filter((o) => o.status === status).length;

  const dashboardTiles = [
    { label: "New Orders", value: countFor("new"), icon: <HiOutlineInboxArrowDown className="h-5 w-5" />, tone: "champagne" as const },
    { label: "Processing", value: countFor("processing"), icon: <HiOutlineCog6Tooth className="h-5 w-5" />, tone: "sky" as const },
    { label: "Ready to Ship", value: countFor("packed"), icon: <HiOutlineArchiveBoxArrowDown className="h-5 w-5" />, tone: "sky" as const },
    { label: "Shipped", value: countFor("shipped"), icon: <HiOutlineTruck className="h-5 w-5" />, tone: "champagne" as const },
    { label: "Delivered", value: countFor("delivered"), icon: <HiOutlineCheckCircle className="h-5 w-5" />, tone: "emerald" as const },
    { label: "Cancelled", value: countFor("cancelled"), icon: <HiOutlineXCircle className="h-5 w-5" />, tone: "rose" as const },
  ];

  const filtered = activeStatus === "all" ? orders : orders.filter((o) => o.status === activeStatus);

  const tabs = [
    { label: "All", href: "/sales/online-orders?status=all", active: activeStatus === "all", count: orders.length },
    ...ONLINE_ORDER_STATUSES.map((s) => ({
      label: STATUS_LABELS[s],
      href: `/sales/online-orders?status=${s}`,
      active: activeStatus === s,
      count: countFor(s),
    })),
  ];

  return (
    <div>
      <PageHeader
        title="Online Orders"
        subtitle="Orders coming from your online store."
        actions={
          <Link href="/sales/online-orders/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Create Order
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {dashboardTiles.map((tile) => (
          <StatTile key={tile.label} label={tile.label} value={String(tile.value)} icon={tile.icon} tone={tile.tone} />
        ))}
      </div>

      <div className="my-5">
        <SegmentedTabs tabs={tabs} />
      </div>

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Items</Th>
            <Th>Amount</Th>
            <Th>Payment</Th>
            <Th>Status</Th>
            <Th>Date</Th>
            <Th>Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={8} message="No orders found." />}
          {filtered.map((o) => (
            <TableRow key={o.id}>
              <Td>
                <Link href={`/sales/online-orders/${o.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {o.orderNumber}
                </Link>
              </Td>
              <Td>{o.customerName}</Td>
              <Td>{o.items.reduce((sum, i) => sum + i.quantity, 0)}</Td>
              <Td>{formatCurrency(onlineOrderTotal(o))}</Td>
              <Td>
                <StatusBadge status={o.paymentStatus} />
              </Td>
              <Td>
                <StatusBadge status={o.status} />
              </Td>
              <Td>{formatDate(o.createdDate)}</Td>
              <Td>
                <Link href={`/sales/online-orders/${o.id}`}>
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

export default function OnlineOrdersPage() {
  return (
    <Suspense fallback={null}>
      <OnlineOrdersContent />
    </Suspense>
  );
}
