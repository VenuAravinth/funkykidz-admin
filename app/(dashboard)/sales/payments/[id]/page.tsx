"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HiOutlineReceiptRefund, HiOutlineArrowUturnLeft } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectCustomerPaymentById, refundPayment, reversePayment } from "@/stores/slices/customerPaymentsSlice";
import { reverseInvoicePayment } from "@/stores/slices/invoicesSlice";

export default function PaymentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const payment = useAppSelector(selectCustomerPaymentById(id));
  const [confirmRefundOpen, setConfirmRefundOpen] = useState(false);
  const [confirmReverseOpen, setConfirmReverseOpen] = useState(false);

  if (!payment) {
    return (
      <div>
        <PageHeader title="Payment not found" backHref="/sales/payments" backLabel="Back to Payments" />
        <p className="text-sm text-ink-muted">
          This payment may have been removed, or the link is out of date.{" "}
          <Link href="/sales/payments" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to payments.
          </Link>
        </p>
      </div>
    );
  }

  const canAct = payment.status === "paid";

  const handleRefund = () => {
    dispatch(refundPayment({ id: payment.id }));
    if (payment.invoiceId) dispatch(reverseInvoicePayment({ id: payment.invoiceId, amount: payment.amount }));
    setConfirmRefundOpen(false);
  };

  const handleReverse = () => {
    dispatch(reversePayment({ id: payment.id }));
    if (payment.invoiceId) dispatch(reverseInvoicePayment({ id: payment.invoiceId, amount: payment.amount }));
    setConfirmReverseOpen(false);
  };

  return (
    <div>
      <PageHeader
        title={payment.paymentNumber}
        subtitle={`Recorded on ${formatDate(payment.date)} for ${payment.customerName}`}
        backHref="/sales/payments"
        backLabel="Back to Payments"
        actions={
          canAct ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setConfirmRefundOpen(true)} className="hover:bg-red-50 hover:text-red-600">
                <HiOutlineReceiptRefund className="h-4 w-4" />
                Refund
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmReverseOpen(true)} className="hover:bg-red-50 hover:text-red-600">
                <HiOutlineArrowUturnLeft className="h-4 w-4" />
                Reverse
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="mb-6">
        <StatusBadge status={payment.status} />
      </div>

      <Card className="max-w-2xl p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Payment Details</h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Customer</dt>
            <dd className="font-medium text-ink">{payment.customerName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Invoice</dt>
            <dd>
              {payment.invoiceId ? (
                <Link href={`/sales/invoices/${payment.invoiceId}`} className="font-medium text-champagne-600 hover:text-champagne-700">
                  {payment.invoiceNumber}
                </Link>
              ) : (
                <span className="font-medium text-ink">{payment.invoiceNumber}</span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Type</dt>
            <dd className="font-medium capitalize text-ink">{payment.type}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Method</dt>
            <dd className="font-medium text-ink">{payment.method}</dd>
          </div>
          {payment.splitBreakdown && (
            <div className="border-t border-glass-border pt-3">
              <dt className="mb-2 text-ink-muted">Split Breakdown</dt>
              <dd>
                <ul className="flex flex-col gap-1">
                  {payment.splitBreakdown.map((s, i) => (
                    <li key={i} className="flex justify-between text-ink">
                      <span>{s.method}</span>
                      <span>{formatCurrency(s.amount)}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-glass-border pt-3">
            <dt className="text-ink-muted">Amount</dt>
            <dd className="text-lg font-semibold text-champagne-700">{formatCurrency(payment.amount)}</dd>
          </div>
          {payment.notes && (
            <div className="border-t border-glass-border pt-3">
              <dt className="mb-1 text-ink-muted">Notes</dt>
              <dd className="text-ink">{payment.notes}</dd>
            </div>
          )}
        </dl>
      </Card>

      <ConfirmDialog
        open={confirmRefundOpen}
        title={`Refund ${payment.paymentNumber}?`}
        description="This marks the payment as refunded and reduces the linked invoice's paid amount accordingly."
        confirmLabel="Refund"
        onConfirm={handleRefund}
        onCancel={() => setConfirmRefundOpen(false)}
      />
      <ConfirmDialog
        open={confirmReverseOpen}
        title={`Reverse ${payment.paymentNumber}?`}
        description="Use this for a failed or bounced payment. It reduces the linked invoice's paid amount accordingly."
        confirmLabel="Reverse"
        onConfirm={handleReverse}
        onCancel={() => setConfirmReverseOpen(false)}
      />
    </div>
  );
}
