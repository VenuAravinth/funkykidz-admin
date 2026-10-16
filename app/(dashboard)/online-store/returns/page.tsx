"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlineArrowRight, HiOutlineXMark } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectOnlineReturns, setOnlineReturnStatus } from "@/stores/slices/onlineStoreSlice";
import { ONLINE_RETURN_FLOW, onlineReturnStatuses, type OnlineReturnStatus } from "@/types/onlineStore";

const STATUS_LABELS: Record<OnlineReturnStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  pickup_scheduled: "Pickup Scheduled",
  received: "Received",
  inspection: "Inspection",
  approved_for_refund: "Approved for Refund",
  refunded: "Refunded",
  rejected: "Rejected",
};

function ReturnsContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const activeStatus = (searchParams.get("status") as OnlineReturnStatus | "all" | null) ?? "all";
  const returns = useAppSelector(selectOnlineReturns);

  const countFor = (status: OnlineReturnStatus) => returns.filter((r) => r.status === status).length;
  const filtered = activeStatus === "all" ? returns : returns.filter((r) => r.status === activeStatus);

  const tabs = [
    { label: "All", href: "/online-store/returns?status=all", active: activeStatus === "all", count: returns.length },
    ...onlineReturnStatuses.map((s) => ({
      label: STATUS_LABELS[s],
      href: `/online-store/returns?status=${s}`,
      active: activeStatus === s,
      count: countFor(s),
    })),
  ];

  const advance = (returnId: string, current: OnlineReturnStatus) => {
    const idx = ONLINE_RETURN_FLOW.indexOf(current);
    const next = ONLINE_RETURN_FLOW[idx + 1];
    if (!next) return;
    const returnRow = returns.find((r) => r.id === returnId);
    dispatch(setOnlineReturnStatus({ id: returnId, status: next, refundAmount: next === "refunded" ? returnRow?.amount : undefined }));
  };

  return (
    <div>
      <PageHeader
        title="Returns & Refunds"
        subtitle="The online return workflow — request, pickup, inspection, refund."
        backHref="/online-store"
        backLabel="Online Store"
      />

      <div className="mb-5">
        <SegmentedTabs tabs={tabs} />
      </div>

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Return</Th>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Product</Th>
            <Th>Amount</Th>
            <Th>Reason</Th>
            <Th>Status</Th>
            <Th>Requested</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={9} message="No returns found." />}
          {filtered.map((r) => {
            const canAdvance = ONLINE_RETURN_FLOW.includes(r.status) && r.status !== "refunded";
            return (
              <TableRow key={r.id}>
                <Td className="font-medium text-ink">{r.returnNumber}</Td>
                <Td>
                  <Link href={`/sales/online-orders/${r.orderId}`} className="hover:text-champagne-700">
                    {r.orderNumber}
                  </Link>
                </Td>
                <Td>{r.customerName}</Td>
                <Td>{r.product}</Td>
                <Td>{formatCurrency(r.amount)}</Td>
                <Td>{r.reason}</Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
                <Td>{formatDate(r.createdDate)}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    {canAdvance && (
                      <IconButton label={`Advance ${r.returnNumber}`} onClick={() => advance(r.id, r.status)}>
                        <HiOutlineArrowRight className="h-4 w-4" />
                      </IconButton>
                    )}
                    {r.status === "requested" && (
                      <IconButton
                        label={`Reject ${r.returnNumber}`}
                        className="hover:bg-red-50 hover:text-red-600"
                        onClick={() => dispatch(setOnlineReturnStatus({ id: r.id, status: "rejected" }))}
                      >
                        <HiOutlineXMark className="h-4 w-4" />
                      </IconButton>
                    )}
                  </div>
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <Suspense fallback={null}>
      <ReturnsContent />
    </Suspense>
  );
}
