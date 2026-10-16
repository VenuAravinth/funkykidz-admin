"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlinePrinter, HiOutlineDocumentArrowDown, HiOutlineArrowRightCircle } from "react-icons/hi2";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { quotationTotal } from "@/lib/dummy-data/quotations";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { addSalesOrder, selectSalesOrderByQuotationId } from "@/stores/slices/salesOrdersSlice";
import type { Quotation } from "@/types/quotation";

function buildWhatsappMessage(quotation: Quotation): string {
  const total = quotationTotal(quotation);
  const lines = quotation.items.map((item) => `• ${item.product} x${item.quantity} — ${formatCurrency(item.quantity * item.unitPrice)}`);
  return `Quotation ${quotation.quotationNumber} for ${quotation.customerName}\n${lines.join("\n")}\nTotal: ${formatCurrency(total)}\nValid until: ${formatDate(quotation.validUntil)}`;
}

function defaultDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function QuotationActions({ quotation, compact = false }: { quotation: Quotation; compact?: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const existingOrder = useAppSelector(selectSalesOrderByQuotationId(quotation.id));
  const [confirmConvertOpen, setConfirmConvertOpen] = useState(false);

  const handlePrint = () => window.print();
  const handleWhatsapp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(buildWhatsappMessage(quotation))}`, "_blank", "noopener,noreferrer");

  const canConvert = quotation.status === "accepted" && !existingOrder;
  const convertTitle = existingOrder ? `Already converted to ${existingOrder.soNumber}.` : "Convert to Sales Order";

  const handleConvert = () => {
    const action = dispatch(
      addSalesOrder({
        customerName: quotation.customerName,
        deliveryDate: defaultDeliveryDate(),
        paymentStatus: "pending",
        paidAmount: 0,
        discount: quotation.discount,
        tax: quotation.tax,
        notes: quotation.notes,
        items: quotation.items.map(({ product, quantity, unitPrice }) => ({ product, quantity, unitPrice })),
        quotationId: quotation.id,
      }),
    );
    setConfirmConvertOpen(false);
    router.push(`/sales/orders/${action.payload.id}`);
  };

  const dialog = (
    <ConfirmDialog
      open={confirmConvertOpen}
      title="Convert to Sales Order?"
      description={`This creates a new sales order for ${quotation.customerName} with the same products, discount, and tax — nothing needs to be re-entered.`}
      confirmLabel="Convert"
      onConfirm={handleConvert}
      onCancel={() => setConfirmConvertOpen(false)}
    />
  );

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <IconButton label="Print" title="Print" onClick={handlePrint}>
          <HiOutlinePrinter className="h-4 w-4" />
        </IconButton>
        <IconButton label="PDF" title="Uses your browser's print dialog — choose “Save as PDF”." onClick={handlePrint}>
          <HiOutlineDocumentArrowDown className="h-4 w-4" />
        </IconButton>
        <IconButton label="Share on WhatsApp" title="Share on WhatsApp" onClick={handleWhatsapp} className="hover:bg-green-50 hover:text-green-600">
          <SiWhatsapp className="h-4 w-4" />
        </IconButton>
        {quotation.status === "accepted" && (
          <IconButton
            label="Convert to Sales Order"
            title={convertTitle}
            disabled={!canConvert}
            onClick={() => setConfirmConvertOpen(true)}
            className="text-champagne-600"
          >
            <HiOutlineArrowRightCircle className="h-4 w-4" />
          </IconButton>
        )}
        {dialog}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto [&>a>button]:w-full">
      <Button variant="secondary" size="sm" onClick={handlePrint}>
        <HiOutlinePrinter className="h-4 w-4" />
        Print
      </Button>
      <Button variant="secondary" size="sm" onClick={handlePrint} title="Uses your browser's print dialog — choose “Save as PDF”.">
        <HiOutlineDocumentArrowDown className="h-4 w-4" />
        PDF
      </Button>
      <Button variant="secondary" size="sm" onClick={handleWhatsapp}>
        <SiWhatsapp className="h-4 w-4" />
        WhatsApp
      </Button>
      {quotation.status === "accepted" &&
        (existingOrder ? (
          <Button size="sm" disabled title={convertTitle}>
            <HiOutlineArrowRightCircle className="h-4 w-4" />
            Convert to Sales Order
          </Button>
        ) : (
          <Button size="sm" onClick={() => setConfirmConvertOpen(true)}>
            <HiOutlineArrowRightCircle className="h-4 w-4" />
            Convert to Sales Order
          </Button>
        ))}
      {dialog}
    </div>
  );
}
