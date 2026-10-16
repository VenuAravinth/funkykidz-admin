"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HiOutlineArchiveBoxArrowDown, HiOutlineTruck, HiOutlineMapPin, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Select } from "@/components/atoms/Select";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectOnlineOrders, setOnlineOrderStatus, setTrackingNumber } from "@/stores/slices/onlineOrdersSlice";
import { selectShippingDetails, setOrderShippingDetail } from "@/stores/slices/onlineStoreSlice";
import { couriers } from "@/types/onlineStore";

export default function ShippingPage() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOnlineOrders);
  const shippingDetails = useAppSelector(selectShippingDetails);
  const detailByOrderId = useMemo(() => new Map(shippingDetails.map((d) => [d.orderId, d])), [shippingDetails]);

  const readyToShip = orders.filter((o) => o.status === "packed").length;
  const shipped = orders.filter((o) => o.status === "shipped").length;
  const inTransit = orders.filter((o) => o.status === "out_for_delivery").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;

  const shippable = orders.filter((o) => ["packed", "shipped", "out_for_delivery"].includes(o.status));

  return (
    <div>
      <PageHeader title="Shipping" subtitle="Manage online delivery — couriers, tracking, and shipment status." backHref="/online-store" backLabel="Online Store" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <StatTile label="Ready to Ship" value={String(readyToShip)} icon={<HiOutlineArchiveBoxArrowDown className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Shipped" value={String(shipped)} icon={<HiOutlineTruck className="h-5 w-5" />} tone="sky" />
        <StatTile label="In Transit" value={String(inTransit)} icon={<HiOutlineMapPin className="h-5 w-5" />} tone="sky" />
        <StatTile label="Delivered" value={String(delivered)} icon={<HiOutlineCheckCircle className="h-5 w-5" />} tone="emerald" />
      </div>

      <div className="my-5" />

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Courier</Th>
            <Th>Tracking Number</Th>
            <Th>Shipping Cost</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {shippable.length === 0 && <TableEmpty colSpan={7} message="Nothing to ship right now." />}
          {shippable.map((order) => {
            const detail = detailByOrderId.get(order.id);
            return (
              <TableRow key={order.id}>
                <Td>
                  <Link href={`/sales/online-orders/${order.id}`} className="font-medium text-ink hover:text-champagne-700">
                    {order.orderNumber}
                  </Link>
                </Td>
                <Td>{order.customerName}</Td>
                <Td>
                  <Select
                    className="h-9"
                    value={detail?.courier ?? ""}
                    onChange={(e) =>
                      dispatch(setOrderShippingDetail({ orderId: order.id, changes: { courier: e.target.value as (typeof couriers)[number] } }))
                    }
                  >
                    <option value="">Select courier</option>
                    {couriers.map((courier) => (
                      <option key={courier} value={courier}>
                        {courier}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Input
                    className="h-9"
                    placeholder="Tracking number"
                    defaultValue={order.trackingNumber ?? ""}
                    onBlur={(e) => e.target.value && dispatch(setTrackingNumber({ id: order.id, trackingNumber: e.target.value }))}
                  />
                </Td>
                <Td>{formatCurrency(detail?.shippingCost ?? 80)}</Td>
                <Td>
                  <StatusBadge status={order.status} />
                </Td>
                <Td className="text-right">
                  {order.status === "packed" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => dispatch(setOnlineOrderStatus({ id: order.id, status: "shipped", note: "Handed to courier." }))}
                    >
                      Mark Shipped
                    </Button>
                  )}
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
        <HiOutlineExclamationTriangle className="h-4 w-4" />
        Courier integrations (Delhivery, DTDC, Blue Dart, India Post, Shiprocket) are configured under Store Settings — this view is provider-agnostic.
      </div>
    </div>
  );
}
