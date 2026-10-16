"use client";

import Link from "next/link";
import { HiOutlineBanknotes, HiOutlineCheckCircle, HiOutlineClock, HiOutlineXCircle, HiOutlineArrowUturnLeft } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { onlineOrderTotal } from "@/lib/dummy-data/onlineOrders";
import { useAppSelector } from "@/stores/hooks";
import { selectOnlineOrders } from "@/stores/slices/onlineOrdersSlice";
import { selectOnlineReturns } from "@/stores/slices/onlineStoreSlice";

const PAYMENT_STATUS_LABEL: Record<string, string> = { paid: "successful", pending: "pending", failed: "failed" };

export default function OnlinePaymentsPage() {
  const orders = useAppSelector(selectOnlineOrders);
  const returns = useAppSelector(selectOnlineReturns);

  const today = new Date().toISOString().slice(0, 10);
  const todaysSales = orders
    .filter((o) => o.createdDate === today && o.paymentStatus === "paid")
    .reduce((sum, o) => sum + onlineOrderTotal(o), 0);
  const successful = orders.filter((o) => o.paymentStatus === "paid").length;
  const pending = orders.filter((o) => o.paymentStatus === "pending").length;
  const failed = orders.filter((o) => o.paymentStatus === "failed").length;
  const refunds = returns.reduce((sum, r) => sum + (r.refundAmount ?? 0), 0);

  return (
    <div>
      <PageHeader title="Online Payments" subtitle="Payments tied to online orders, separate from your payment gateway." backHref="/online-store" backLabel="Online Store" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Today's Online Sales" value={formatCurrency(todaysSales)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Successful Payments" value={String(successful)} icon={<HiOutlineCheckCircle className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Pending Payments" value={String(pending)} icon={<HiOutlineClock className="h-5 w-5" />} tone="sky" />
        <StatTile label="Failed Payments" value={String(failed)} icon={<HiOutlineXCircle className="h-5 w-5" />} tone="rose" />
        <StatTile label="Refunds" value={formatCurrency(refunds)} icon={<HiOutlineArrowUturnLeft className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="my-5" />

      <Table>
        <TableHead>
          <TableRow>
            <Th>Order</Th>
            <Th>Amount</Th>
            <Th>Method</Th>
            <Th>Gateway Reference</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length === 0 && <TableEmpty colSpan={6} message="No online payments yet." />}
          {orders.map((order) => (
            <TableRow key={order.id}>
              <Td>
                <Link href={`/sales/online-orders/${order.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {order.orderNumber}
                </Link>
              </Td>
              <Td>{formatCurrency(onlineOrderTotal(order))}</Td>
              <Td>{order.paymentMethod}</Td>
              <Td className="text-ink-muted">{order.paymentStatus === "paid" ? `pay_${order.id}` : "—"}</Td>
              <Td>
                <StatusBadge status={PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus} />
              </Td>
              <Td>{formatDate(order.createdDate)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
