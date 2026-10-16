"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowUturnLeft, HiOutlineReceiptRefund } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/atoms/Table";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { onlineOrderTotal } from "@/lib/dummy-data/onlineOrders";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectOnlineOrderById, setOnlineOrderStatus, setOnlineOrderPaymentStatus, setTrackingNumber, markStockFulfilled } from "@/stores/slices/onlineOrdersSlice";
import { selectProducts, selectVariants, reserveStock, releaseReservedStock, fulfillReservedStock } from "@/stores/slices/catalogSlice";
import { addMovement } from "@/stores/slices/stockMovementsSlice";
import { selectAuthUser } from "@/stores/slices/authSlice";
import { ONLINE_ORDER_FLOW, type OnlineOrderStatus } from "@/types/onlineOrder";

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

const ADVANCE_NOTES: Partial<Record<OnlineOrderStatus, string>> = {
  confirmed: "Payment verified — stock reserved.",
  processing: "Picking started.",
  packed: "Packed and ready for courier pickup — stock deducted.",
  shipped: "Handed to courier.",
  out_for_delivery: "Out for delivery.",
  delivered: "Delivered and signed for.",
};

export default function OnlineOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectOnlineOrderById(id));
  const products = useAppSelector(selectProducts);
  const variants = useAppSelector(selectVariants);
  const authUser = useAppSelector(selectAuthUser);

  const [trackingInput, setTrackingInput] = useState("");
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmReturnOpen, setConfirmReturnOpen] = useState(false);
  const [confirmRefundOpen, setConfirmRefundOpen] = useState(false);

  if (!order) {
    return (
      <div>
        <PageHeader title="Order not found" backHref="/sales/online-orders" backLabel="Back to Online Orders" />
        <p className="text-sm text-ink-muted">
          This order may have been removed, or the link is out of date.{" "}
          <Link href="/sales/online-orders" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to online orders.
          </Link>
        </p>
      </div>
    );
  }

  const getLiveStock = (productId: string, variantId?: string) => {
    const product = products.find((p) => p.id === productId);
    const v = variants.find((v) => v.id === variantId) ?? product?.variants[0];
    return { stock: v?.stock ?? 0, reserved: v?.reservedStock ?? 0 };
  };

  const flowIndex = ONLINE_ORDER_FLOW.indexOf(order.status);
  const nextStatus = flowIndex >= 0 && flowIndex < ONLINE_ORDER_FLOW.length - 1 ? ONLINE_ORDER_FLOW[flowIndex + 1] : null;
  const isTerminal = !ONLINE_ORDER_FLOW.includes(order.status);

  const paymentBlocksAdvance = nextStatus === "confirmed" && order.paymentStatus !== "paid";
  const trackingBlocksAdvance = nextStatus === "shipped" && !order.trackingNumber;
  const canAdvance = !!nextStatus && !paymentBlocksAdvance && !trackingBlocksAdvance;

  const canCancel = !isTerminal && order.status !== "delivered";
  const canReturn = order.status === "delivered";
  const canRefund = order.status === "returned";

  const handleAdvance = () => {
    if (!nextStatus) return;

    if (nextStatus === "confirmed") {
      for (const item of order.items) {
        dispatch(reserveStock({ productId: item.productId, variantId: item.variantId, quantity: item.quantity }));
      }
    }

    if (nextStatus === "packed") {
      for (const item of order.items) {
        const { stock } = getLiveStock(item.productId, item.variantId);
        dispatch(fulfillReservedStock({ productId: item.productId, variantId: item.variantId, quantity: item.quantity }));
        dispatch(
          addMovement({
            productId: item.productId,
            barcode: item.barcode,
            date: new Date().toISOString().slice(0, 10),
            type: "Sale",
            reference: `ONLINE-${order.orderNumber}`,
            quantity: -item.quantity,
            balanceBefore: stock,
            balanceAfter: Math.max(0, stock - item.quantity),
            performedBy: authUser?.name ?? "Demo User",
            reason: "Online order fulfilled",
          }),
        );
      }
      dispatch(markStockFulfilled({ id: order.id }));
    }

    dispatch(setOnlineOrderStatus({ id: order.id, status: nextStatus, note: ADVANCE_NOTES[nextStatus] }));
  };

  const handleVerifyPayment = () => dispatch(setOnlineOrderPaymentStatus({ id: order.id, status: "paid" }));

  const handleSaveTracking = () => {
    if (!trackingInput.trim()) return;
    dispatch(setTrackingNumber({ id: order.id, trackingNumber: trackingInput.trim() }));
    setTrackingInput("");
  };

  const handleCancel = () => {
    if (order.status !== "new" && !order.stockFulfilled) {
      for (const item of order.items) {
        dispatch(releaseReservedStock({ productId: item.productId, variantId: item.variantId, quantity: item.quantity }));
      }
    }
    dispatch(setOnlineOrderStatus({ id: order.id, status: "cancelled", note: "Order cancelled by staff." }));
    setConfirmCancelOpen(false);
  };

  const total = onlineOrderTotal(order);

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        subtitle={`Placed on ${formatDate(order.createdDate)} by ${order.customerName}`}
        backHref="/sales/online-orders"
        backLabel="Back to Online Orders"
        actions={
          <>
            {order.status === "new" && order.paymentStatus === "pending" && (
              <Button variant="secondary" size="sm" onClick={handleVerifyPayment}>
                <HiOutlineCheckCircle className="h-4 w-4" />
                Verify Payment
              </Button>
            )}
            {nextStatus && (
              <Button
                size="sm"
                disabled={!canAdvance}
                title={paymentBlocksAdvance ? "Verify payment first." : trackingBlocksAdvance ? "Add a tracking number first." : undefined}
                onClick={handleAdvance}
              >
                <HiOutlineArrowRight className="h-4 w-4" />
                Advance to {STATUS_LABELS[nextStatus]}
              </Button>
            )}
            {canCancel && (
              <Button variant="secondary" size="sm" onClick={() => setConfirmCancelOpen(true)} className="hover:bg-red-50 hover:text-red-600">
                <HiOutlineXCircle className="h-4 w-4" />
                Cancel Order
              </Button>
            )}
            {canReturn && (
              <Button variant="secondary" size="sm" onClick={() => setConfirmReturnOpen(true)}>
                <HiOutlineArrowUturnLeft className="h-4 w-4" />
                Mark Returned
              </Button>
            )}
            {canRefund && (
              <Button variant="secondary" size="sm" onClick={() => setConfirmRefundOpen(true)}>
                <HiOutlineReceiptRefund className="h-4 w-4" />
                Mark Refunded
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={order.status} />
        <StatusBadge status={order.paymentStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="mb-4 text-base font-semibold text-ink">Customer</h2>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Name</dt>
                <dd className="font-medium text-ink">{order.customerName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Phone</dt>
                <dd className="font-medium text-ink">{order.phone}</dd>
              </div>
              <div className="border-t border-glass-border pt-3">
                <dt className="mb-1 text-ink-muted">Address</dt>
                <dd className="text-ink">{order.address}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-base font-semibold text-ink">Payment</h2>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Method</dt>
                <dd className="font-medium text-ink">{order.paymentMethod}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Status</dt>
                <dd>
                  <StatusBadge status={order.paymentStatus} />
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Amount</dt>
                <dd className="font-semibold text-champagne-700">{formatCurrency(total)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-base font-semibold text-ink">Shipping</h2>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Method</dt>
                <dd className="font-medium text-ink">{order.shippingMethod}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Tracking Number</dt>
                <dd className="font-medium text-ink">{order.trackingNumber ?? "—"}</dd>
              </div>
              {!order.trackingNumber && (order.status === "packed" || order.status === "processing") && (
                <div className="flex gap-2 border-t border-glass-border pt-3">
                  <Input placeholder="Enter tracking number" className="h-9" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} />
                  <Button type="button" size="sm" onClick={handleSaveTracking}>
                    Save
                  </Button>
                </div>
              )}
            </dl>
          </Card>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-2">
          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Products</h2>
            <Table paginate={false}>
              <TableHead>
                <TableRow>
                  <Th>Product</Th>
                  <Th>Quantity</Th>
                  <Th>Price</Th>
                  <Th>Line Total</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <Td>
                      {item.product}
                      <div className="text-xs text-ink-muted">{item.barcode}</div>
                    </Td>
                    <Td>{item.quantity}</Td>
                    <Td>{formatCurrency(item.price)}</Td>
                    <Td>{formatCurrency(item.quantity * item.price)}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-3 flex justify-end text-sm">
              <span className="text-ink-muted">Order Total&nbsp;</span>
              <span className="font-semibold text-champagne-700">{formatCurrency(total)}</span>
            </div>
          </div>

          <Card className="p-5">
            <h2 className="mb-1 text-base font-semibold text-ink">Stock Reservation</h2>
            <p className="mb-4 text-xs text-ink-muted">
              Confirmed online orders hold stock so the same unit can&apos;t be sold twice at the till — the hold converts into an actual deduction once
              packed.
            </p>
            <Table paginate={false}>
              <TableHead>
                <TableRow>
                  <Th>Product</Th>
                  <Th>Ordered</Th>
                  <Th>Total Stock</Th>
                  <Th>Reserved</Th>
                  <Th>Available</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => {
                  const { stock, reserved } = getLiveStock(item.productId, item.variantId);
                  return (
                    <TableRow key={item.id}>
                      <Td>{item.product}</Td>
                      <Td>{item.quantity}</Td>
                      <Td>{stock}</Td>
                      <Td>{reserved}</Td>
                      <Td className="font-medium text-emerald-600">{Math.max(0, stock - reserved)}</Td>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-base font-semibold text-ink">Order Timeline</h2>
            <ul className="flex flex-col gap-4">
              {[...order.timeline].reverse().map((entry, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-champagne-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{STATUS_LABELS[entry.status]}</span>
                      <span className="text-xs text-ink-muted">{formatDateTime(entry.at)}</span>
                    </div>
                    {entry.note && <p className="text-xs text-ink-muted">{entry.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancelOpen}
        title={`Cancel ${order.orderNumber}?`}
        description={
          order.stockFulfilled
            ? "Stock for this order has already been deducted and won't be automatically restored."
            : "Any stock reserved for this order will be released back to available stock."
        }
        confirmLabel="Cancel Order"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancelOpen(false)}
      />
      <ConfirmDialog
        open={confirmReturnOpen}
        title={`Mark ${order.orderNumber} as returned?`}
        description="This records that the customer sent the order back. Restocking is handled separately."
        confirmLabel="Mark Returned"
        onConfirm={() => {
          dispatch(setOnlineOrderStatus({ id: order.id, status: "returned", note: "Customer returned the order." }));
          setConfirmReturnOpen(false);
        }}
        onCancel={() => setConfirmReturnOpen(false)}
      />
      <ConfirmDialog
        open={confirmRefundOpen}
        title={`Mark ${order.orderNumber} as refunded?`}
        description="This records that the refund was processed. Process the actual refund in your payment system separately."
        confirmLabel="Mark Refunded"
        onConfirm={() => {
          dispatch(setOnlineOrderStatus({ id: order.id, status: "refunded", note: "Refund processed." }));
          setConfirmRefundOpen(false);
        }}
        onCancel={() => setConfirmRefundOpen(false)}
      />
    </div>
  );
}
