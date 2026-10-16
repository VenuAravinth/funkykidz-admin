"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { HiOutlinePrinter, HiOutlineDocumentArrowDown, HiOutlineArrowUpCircle } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { estimationSubtotal, estimationTotal } from "@/lib/dummy-data/estimations";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectEstimationById, setEstimationStatus } from "@/stores/slices/estimationsSlice";
import { addQuotation } from "@/stores/slices/quotationsSlice";
import { selectAuthUser } from "@/stores/slices/authSlice";

const CONVERTIBLE_STATUSES = new Set(["draft", "sent", "viewed"]);

export default function EstimationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const estimation = useAppSelector(selectEstimationById(id));
  const authUser = useAppSelector(selectAuthUser);
  const [confirmConvertOpen, setConfirmConvertOpen] = useState(false);

  if (!estimation) {
    return (
      <div>
        <PageHeader title="Estimation not found" backHref="/sales/estimations" backLabel="Back to Estimations" />
        <p className="text-sm text-ink-muted">
          This estimation may have been removed, or the link is out of date.{" "}
          <Link href="/sales/estimations" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the estimations list.
          </Link>
        </p>
      </div>
    );
  }

  const subtotal = estimationSubtotal(estimation);
  const discountAmount = subtotal * (estimation.discount / 100);
  const taxAmount = (subtotal - discountAmount) * (estimation.tax / 100);
  const total = estimationTotal(estimation);

  const whatsappMessage = `Estimation ${estimation.estimationNumber} for ${estimation.customerName}\n${estimation.items
    .map((item) => `• ${item.product} x${item.quantity} — ${formatCurrency(item.quantity * item.unitPrice)}`)
    .join("\n")}\nTotal: ${formatCurrency(total)}\nValid until: ${formatDate(estimation.validUntil)}`;

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title={estimation.estimationNumber}
          subtitle={`Created on ${formatDate(estimation.createdDate)} for ${estimation.customerName}`}
          backHref="/sales/estimations"
          backLabel="Back to Estimations"
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                <HiOutlinePrinter className="h-4 w-4" />
                Print
              </Button>
              <Button variant="secondary" size="sm" onClick={() => window.print()} title="Use your browser's print dialog and choose “Save as PDF”.">
                <HiOutlineDocumentArrowDown className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, "_blank", "noopener,noreferrer")}
              >
                WhatsApp
              </Button>
              {CONVERTIBLE_STATUSES.has(estimation.status) && (
                <Button size="sm" onClick={() => setConfirmConvertOpen(true)}>
                  <HiOutlineArrowUpCircle className="h-4 w-4" />
                  Convert to Quotation
                </Button>
              )}
            </>
          }
        />
      </div>

      <div className="print-area grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Estimation Summary</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Status</dt>
              <dd>
                <StatusBadge status={estimation.status} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Customer</dt>
              <dd className="font-medium text-ink">{estimation.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Created</dt>
              <dd className="font-medium text-ink">{formatDate(estimation.createdDate)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Valid Until</dt>
              <dd className="font-medium text-ink">{formatDate(estimation.validUntil)}</dd>
            </div>
            {estimation.notes && (
              <div className="border-t border-glass-border pt-3">
                <dt className="mb-1 text-ink-muted">Notes</dt>
                <dd className="text-ink">{estimation.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="xl:col-span-2">
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
              {estimation.items.map((item) => (
                <TableRow key={item.id}>
                  <Td>{item.product}</Td>
                  <Td>{item.quantity}</Td>
                  <Td>{formatCurrency(item.unitPrice)}</Td>
                  <Td>{formatCurrency(item.quantity * item.unitPrice)}</Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs rounded-xl border border-glass-border bg-white/50 p-4 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Subtotal</span>
                <span className="font-medium text-ink">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Discount ({estimation.discount}%)</span>
                <span className="font-medium text-ink">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Tax ({estimation.tax}%)</span>
                <span className="font-medium text-ink">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-glass-border pt-2">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-lg font-semibold text-champagne-700">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmConvertOpen}
        title="Convert to Quotation?"
        description={`This creates a new quotation for ${estimation.customerName} with the same products, discount, and tax — nothing needs to be re-entered.`}
        confirmLabel="Convert"
        onConfirm={() => {
          const action = dispatch(
            addQuotation({
              customerName: estimation.customerName,
              salesperson: authUser?.name ?? "Demo User",
              validUntil: estimation.validUntil,
              discount: estimation.discount,
              tax: estimation.tax,
              notes: estimation.notes,
              items: estimation.items.map(({ product, quantity, unitPrice }) => ({ product, quantity, unitPrice })),
              estimationId: estimation.id,
            }),
          );
          dispatch(setEstimationStatus({ id: estimation.id, status: "converted" }));
          setConfirmConvertOpen(false);
          router.push(`/sales/quotations/${action.payload.id}`);
        }}
        onCancel={() => setConfirmConvertOpen(false)}
      />
    </div>
  );
}
