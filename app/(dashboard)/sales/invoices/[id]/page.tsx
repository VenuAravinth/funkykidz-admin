"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { HiOutlinePencil, HiOutlineBanknotes } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { InvoiceActions } from "@/components/organisms/InvoiceActions";
import { formatCurrency, formatDate } from "@/lib/format";
import { invoiceSubtotal, invoiceGstAmount, invoiceGrandTotal, invoiceBalance } from "@/lib/dummy-data/invoices";
import { getSalesOrderById } from "@/lib/dummy-data/salesOrders";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoiceById } from "@/stores/slices/invoicesSlice";
import { cn } from "@/lib/cn";

const dashed = "border-t border-dashed border-ink/25";

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const invoice = useAppSelector(selectInvoiceById(id));

  if (!invoice) {
    return (
      <div>
        <PageHeader title="Invoice not found" backHref="/sales/invoices" backLabel="Back to Invoices" />
        <p className="text-sm text-ink-muted">
          This invoice may have been removed, or the link is out of date.{" "}
          <Link href="/sales/invoices" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the invoices list.
          </Link>
        </p>
      </div>
    );
  }

  const subtotal = invoiceSubtotal(invoice);
  const gstAmount = invoiceGstAmount(invoice);
  const grandTotal = invoiceGrandTotal(invoice);
  const balance = invoiceBalance(invoice);
  const sourceOrder = invoice.salesOrderId ? getSalesOrderById(invoice.salesOrderId) : undefined;

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title={invoice.invoiceNumber}
          subtitle={`Created on ${formatDate(invoice.createdDate)} for ${invoice.customerName}`}
          backHref="/sales/invoices"
          backLabel="Back to Invoices"
          actions={
            <>
              {balance > 0 && (
                <Link href={`/sales/payments/new?invoiceId=${invoice.id}`}>
                  <Button size="sm">
                    <HiOutlineBanknotes className="h-4 w-4" />
                    Record Payment
                  </Button>
                </Link>
              )}
              <Link href={`/sales/invoices/${invoice.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <HiOutlinePencil className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <InvoiceActions invoice={invoice} />
            </>
          }
        />

        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge status={invoice.status} />
          {sourceOrder && (
            <span className="text-ink-muted">
              From Sales Order{" "}
              <Link href={`/sales/orders/${sourceOrder.id}`} className="font-medium text-champagne-600 hover:text-champagne-700">
                {sourceOrder.soNumber}
              </Link>
            </span>
          )}
        </div>
      </div>

      <div className="print-area flex justify-center">
        <Card className="w-full max-w-md p-6 font-mono text-sm text-ink">
          <p className="text-center text-lg font-semibold tracking-[0.2em]">FUNKY KIDS</p>
          <div className={cn(dashed, "my-3")} />

          <p>
            Invoice: <span className="font-semibold">{invoice.invoiceNumber}</span>
          </p>
          <p>Date: {formatDate(invoice.createdDate)}</p>

          <p className="mt-4 text-ink-muted">Customer:</p>
          <p className="font-semibold">{invoice.customerName}</p>
          <p>{invoice.customerPhone}</p>

          <div className={cn(dashed, "my-3")} />

          <div className="grid grid-cols-[2fr_0.6fr_1fr_1fr] gap-1 text-xs font-semibold text-ink-muted">
            <span>Product</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Total</span>
          </div>
          <div className={cn(dashed, "my-1")} />
          {invoice.items.map((item) => (
            <div key={item.id} className="grid grid-cols-[2fr_0.6fr_1fr_1fr] gap-1 py-0.5">
              <span className="truncate">{item.product}</span>
              <span className="text-right">{item.quantity}</span>
              <span className="text-right">{formatCurrency(item.rate)}</span>
              <span className="text-right">{formatCurrency(item.quantity * item.rate)}</span>
            </div>
          ))}

          <div className={cn(dashed, "my-3")} />

          <div className="flex justify-between py-0.5">
            <span className="text-ink-muted">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-ink-muted">Discount</span>
            <span>{formatCurrency(invoice.discountAmount)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-ink-muted">GST ({invoice.gstPercent}%)</span>
            <span>{formatCurrency(gstAmount)}</span>
          </div>

          <div className={cn(dashed, "my-3")} />

          <div className="flex justify-between py-0.5 text-base font-semibold text-champagne-700">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-ink-muted">Paid</span>
            <span>{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between py-0.5 font-semibold">
            <span>Balance</span>
            <span className={balance > 0 ? "text-red-600" : "text-emerald-600"}>{formatCurrency(balance)}</span>
          </div>
          {invoice.paymentMethod && (
            <div className="flex justify-between py-0.5 text-xs text-ink-muted">
              <span>Payment</span>
              <span>{invoice.paymentMethod}</span>
            </div>
          )}

          {invoice.notes && (
            <>
              <div className={cn(dashed, "my-3")} />
              <p className="text-xs text-ink-muted">{invoice.notes}</p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
