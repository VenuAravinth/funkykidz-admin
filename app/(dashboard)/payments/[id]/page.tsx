import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { RecordPaymentForm } from "@/components/organisms/RecordPaymentForm";
import { formatCurrency, formatDate } from "@/lib/format";
import { supplierPayments } from "@/lib/dummy-data/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const payment = supplierPayments.find((p) => p.id === id);
  return { title: payment ? `${payment.paymentRef} — Supplier Management` : "Payment — Supplier Management" };
}

export default async function PaymentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = supplierPayments.find((p) => p.id === id);
  if (!payment) notFound();

  return (
    <div>
      <PageHeader
        title={payment.paymentRef}
        subtitle={`Invoice ${payment.invoiceNumber}`}
        backHref="/payments"
        backLabel="Back to Supplier Payments"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Payment Summary</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Status</dt>
              <dd>
                <StatusBadge status={payment.status} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Supplier</dt>
              <dd>
                <Link href={`/suppliers/${payment.supplierId}`} className="font-medium text-ink hover:text-champagne-700">
                  {payment.supplierName}
                </Link>
              </dd>
            </div>
            {payment.poNumber && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Purchase Order</dt>
                <dd>
                  <Link href={`/purchase-orders/${payment.poId}`} className="font-medium text-ink hover:text-champagne-700">
                    {payment.poNumber}
                  </Link>
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Due Date</dt>
              <dd className="font-medium text-ink">{formatDate(payment.dueDate)}</dd>
            </div>
            {payment.paidDate && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Paid Date</dt>
                <dd className="font-medium text-ink">{formatDate(payment.paidDate)}</dd>
              </div>
            )}
            {payment.method && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Method</dt>
                <dd className="font-medium text-ink">{payment.method}</dd>
              </div>
            )}
            <div className="border-t border-glass-border pt-3">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Invoice Amount</dt>
                <dd className="font-semibold text-ink">{formatCurrency(payment.amount)}</dd>
              </div>
              <div className="mt-1 flex justify-between gap-4">
                <dt className="text-ink-muted">Paid So Far</dt>
                <dd className="font-semibold text-ink">{formatCurrency(payment.paidAmount)}</dd>
              </div>
              <div className="mt-1 flex justify-between gap-4">
                <dt className="text-ink-muted">Balance Due</dt>
                <dd className="font-semibold text-champagne-700">{formatCurrency(payment.amount - payment.paidAmount)}</dd>
              </div>
            </div>
          </dl>
        </Card>

        <div className="xl:col-span-2">
          {payment.status === "paid" ? (
            <Card className="p-6">
              <p className="text-sm text-ink-muted">
                This invoice has been paid in full{payment.paidDate ? ` on ${formatDate(payment.paidDate)}` : ""} via{" "}
                {payment.method ?? "an on-file method"}.
              </p>
            </Card>
          ) : (
            <Card className="p-6">
              <h2 className="mb-4 text-base font-semibold text-ink">Record Payment</h2>
              <RecordPaymentForm payment={payment} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
