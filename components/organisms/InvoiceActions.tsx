"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlinePrinter,
  HiOutlineDocumentArrowDown,
  HiOutlineEnvelope,
  HiOutlineReceiptRefund,
  HiOutlineDocumentDuplicate,
} from "react-icons/hi2";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { formatCurrency, formatDate } from "@/lib/format";
import { invoiceGrandTotal } from "@/lib/dummy-data/invoices";
import { useAppDispatch } from "@/stores/hooks";
import { addInvoice } from "@/stores/slices/invoicesSlice";
import type { Invoice } from "@/types/invoice";

const REFUNDABLE_STATUSES = new Set(["paid", "partially_paid"]);

function buildSummaryMessage(invoice: Invoice): string {
  const total = invoiceGrandTotal(invoice);
  const lines = invoice.items.map((item) => `• ${item.product} x${item.quantity} — ${formatCurrency(item.quantity * item.rate)}`);
  return `Invoice ${invoice.invoiceNumber} for ${invoice.customerName}\n${lines.join("\n")}\nGrand Total: ${formatCurrency(total)}\nDate: ${formatDate(invoice.createdDate)}`;
}

export function InvoiceActions({ invoice, compact = false }: { invoice: Invoice; compact?: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handlePrint = () => window.print();
  const handleWhatsapp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(buildSummaryMessage(invoice))}`, "_blank", "noopener,noreferrer");
  const handleEmail = () => {
    const subject = `Invoice ${invoice.invoiceNumber}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildSummaryMessage(invoice))}`;
  };
  const handleDuplicate = () => {
    const action = dispatch(
      addInvoice({
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        discountAmount: invoice.discountAmount,
        gstPercent: invoice.gstPercent,
        paidAmount: 0,
        notes: invoice.notes,
        items: invoice.items.map(({ product, quantity, rate }) => ({ product, quantity, rate })),
      }),
    );
    router.push(`/sales/invoices/${action.payload.id}`);
  };

  const canRefund = REFUNDABLE_STATUSES.has(invoice.status);
  const refundTitle = canRefund ? "Refund" : "Only paid invoices can be refunded.";

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <IconButton label="Print" title="Print" onClick={handlePrint}>
          <HiOutlinePrinter className="h-4 w-4" />
        </IconButton>
        <IconButton label="Download PDF" title="Uses your browser's print dialog — choose “Save as PDF”." onClick={handlePrint}>
          <HiOutlineDocumentArrowDown className="h-4 w-4" />
        </IconButton>
        <IconButton label="Share on WhatsApp" title="Share on WhatsApp" onClick={handleWhatsapp} className="hover:bg-green-50 hover:text-green-600">
          <SiWhatsapp className="h-4 w-4" />
        </IconButton>
        <IconButton label="Email" title="Email" onClick={handleEmail}>
          <HiOutlineEnvelope className="h-4 w-4" />
        </IconButton>
        {canRefund ? (
          <Link href={`/sales/returns/new?invoiceId=${invoice.id}`}>
            <IconButton label="Refund" title="Start a return for this invoice" className="hover:bg-red-50 hover:text-red-600">
              <HiOutlineReceiptRefund className="h-4 w-4" />
            </IconButton>
          </Link>
        ) : (
          <IconButton label="Refund" title={refundTitle} disabled className="hover:bg-red-50 hover:text-red-600">
            <HiOutlineReceiptRefund className="h-4 w-4" />
          </IconButton>
        )}
        <IconButton label="Duplicate" title="Duplicate" onClick={handleDuplicate}>
          <HiOutlineDocumentDuplicate className="h-4 w-4" />
        </IconButton>
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
        Download PDF
      </Button>
      <Button variant="secondary" size="sm" onClick={handleWhatsapp}>
        <SiWhatsapp className="h-4 w-4" />
        WhatsApp
      </Button>
      <Button variant="secondary" size="sm" onClick={handleEmail}>
        <HiOutlineEnvelope className="h-4 w-4" />
        Email
      </Button>
      {canRefund ? (
        <Link href={`/sales/returns/new?invoiceId=${invoice.id}`}>
          <Button variant="secondary" size="sm" className="hover:bg-red-50 hover:text-red-600">
            <HiOutlineReceiptRefund className="h-4 w-4" />
            Refund
          </Button>
        </Link>
      ) : (
        <Button variant="secondary" size="sm" disabled title={refundTitle} className="hover:bg-red-50 hover:text-red-600">
          <HiOutlineReceiptRefund className="h-4 w-4" />
          Refund
        </Button>
      )}
      <Button variant="secondary" size="sm" onClick={handleDuplicate}>
        <HiOutlineDocumentDuplicate className="h-4 w-4" />
        Duplicate
      </Button>
    </div>
  );
}
