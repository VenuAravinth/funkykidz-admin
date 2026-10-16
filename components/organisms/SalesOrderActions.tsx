"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlinePrinter, HiOutlineDocumentText, HiOutlineXCircle, HiOutlineArrowUturnLeft } from "react-icons/hi2";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { salesOrderSubtotal, salesOrderTotal } from "@/lib/dummy-data/salesOrders";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { setOrderStatus } from "@/stores/slices/salesOrdersSlice";
import { addInvoice, selectInvoiceBySalesOrderId } from "@/stores/slices/invoicesSlice";
import type { SalesOrder } from "@/types/salesOrder";

const NOT_CANCELLABLE = new Set(["cancelled", "completed"]);

function buildWhatsappMessage(order: SalesOrder): string {
  const total = salesOrderTotal(order);
  const lines = order.items.map((item) => `• ${item.product} x${item.quantity} — ${formatCurrency(item.quantity * item.unitPrice)}`);
  return `Sales Order ${order.soNumber} for ${order.customerName}\n${lines.join("\n")}\nTotal: ${formatCurrency(total)}\nDelivery: ${formatDate(order.deliveryDate)}`;
}

export function SalesOrderActions({ order, compact = false }: { order: SalesOrder; compact?: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const existingInvoice = useAppSelector(selectInvoiceBySalesOrderId(order.id));
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmInvoiceOpen, setConfirmInvoiceOpen] = useState(false);

  const handlePrint = () => window.print();
  const handleWhatsapp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(buildWhatsappMessage(order))}`, "_blank", "noopener,noreferrer");
  const canCancel = !NOT_CANCELLABLE.has(order.status);
  const returnDisabledReason = "Bill this order first — returns are filed against an invoice.";
  const canCreateInvoice = !existingInvoice;
  const invoiceTitle = existingInvoice ? `Already billed as ${existingInvoice.invoiceNumber}.` : "Create Invoice";

  const handleCreateInvoice = () => {
    const subtotal = salesOrderSubtotal(order);
    const action = dispatch(
      addInvoice({
        customerName: order.customerName,
        customerPhone: "",
        discountAmount: Math.round(subtotal * (order.discount / 100)),
        gstPercent: order.tax,
        paidAmount: order.paidAmount,
        notes: order.notes,
        items: order.items.map(({ product, quantity, unitPrice }) => ({ product, quantity, rate: unitPrice })),
        salesOrderId: order.id,
      }),
    );
    setConfirmInvoiceOpen(false);
    router.push(`/sales/invoices/${action.payload.id}`);
  };

  const cancelDialog = (
    <ConfirmDialog
      open={confirmCancelOpen}
      title={`Cancel ${order.soNumber}?`}
      description="This marks the sales order as cancelled. Fulfillment and payment already recorded aren't reversed automatically."
      confirmLabel="Cancel Order"
      onConfirm={() => {
        dispatch(setOrderStatus({ id: order.id, status: "cancelled" }));
        setConfirmCancelOpen(false);
      }}
      onCancel={() => setConfirmCancelOpen(false)}
    />
  );

  const invoiceDialog = (
    <ConfirmDialog
      open={confirmInvoiceOpen}
      title="Create Invoice?"
      description={`This creates a new invoice for ${order.customerName} with the same products — nothing needs to be re-entered. Add the customer's phone number afterward.`}
      confirmLabel="Create Invoice"
      onConfirm={handleCreateInvoice}
      onCancel={() => setConfirmInvoiceOpen(false)}
    />
  );

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <IconButton
          label="Create Invoice"
          title={invoiceTitle}
          disabled={!canCreateInvoice}
          onClick={() => setConfirmInvoiceOpen(true)}
          className="text-champagne-600"
        >
          <HiOutlineDocumentText className="h-4 w-4" />
        </IconButton>
        <IconButton label="Print" title="Print" onClick={handlePrint}>
          <HiOutlinePrinter className="h-4 w-4" />
        </IconButton>
        <IconButton label="Share on WhatsApp" title="Share on WhatsApp" onClick={handleWhatsapp} className="hover:bg-green-50 hover:text-green-600">
          <SiWhatsapp className="h-4 w-4" />
        </IconButton>
        <IconButton
          label="Cancel Order"
          title={canCancel ? "Cancel Order" : "This order can't be cancelled."}
          disabled={!canCancel}
          onClick={() => setConfirmCancelOpen(true)}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <HiOutlineXCircle className="h-4 w-4" />
        </IconButton>
        {existingInvoice ? (
          <Link href={`/sales/returns/new?invoiceId=${existingInvoice.id}`}>
            <IconButton label="Return" title="Return">
              <HiOutlineArrowUturnLeft className="h-4 w-4" />
            </IconButton>
          </Link>
        ) : (
          <IconButton label="Return" title={returnDisabledReason} disabled>
            <HiOutlineArrowUturnLeft className="h-4 w-4" />
          </IconButton>
        )}
        {cancelDialog}
        {invoiceDialog}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto [&>a>button]:w-full">
      <Button variant="secondary" size="sm" disabled={!canCreateInvoice} title={canCreateInvoice ? undefined : invoiceTitle} onClick={() => setConfirmInvoiceOpen(true)}>
        <HiOutlineDocumentText className="h-4 w-4" />
        Create Invoice
      </Button>
      <Button variant="secondary" size="sm" onClick={handlePrint}>
        <HiOutlinePrinter className="h-4 w-4" />
        Print
      </Button>
      <Button variant="secondary" size="sm" onClick={handleWhatsapp}>
        <SiWhatsapp className="h-4 w-4" />
        WhatsApp
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={!canCancel}
        title={canCancel ? undefined : "This order can't be cancelled."}
        onClick={() => setConfirmCancelOpen(true)}
        className="hover:bg-red-50 hover:text-red-600"
      >
        <HiOutlineXCircle className="h-4 w-4" />
        Cancel
      </Button>
      {existingInvoice ? (
        <Link href={`/sales/returns/new?invoiceId=${existingInvoice.id}`}>
          <Button variant="secondary" size="sm">
            <HiOutlineArrowUturnLeft className="h-4 w-4" />
            Return
          </Button>
        </Link>
      ) : (
        <Button variant="secondary" size="sm" disabled title={returnDisabledReason}>
          <HiOutlineArrowUturnLeft className="h-4 w-4" />
          Return
        </Button>
      )}
      {cancelDialog}
      {invoiceDialog}
    </div>
  );
}
