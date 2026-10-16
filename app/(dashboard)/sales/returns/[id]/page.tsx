"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineXCircle, HiOutlineBanknotes } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectReturnById, setReturnInspection, rejectReturn, issueRefund } from "@/stores/slices/returnsSlice";
import { restockFromReturn, markReturnedDamaged } from "@/stores/slices/catalogSlice";
import { addMovement } from "@/stores/slices/stockMovementsSlice";
import { selectAuthUser } from "@/stores/slices/authSlice";
import { setInvoiceStatus } from "@/stores/slices/invoicesSlice";
import { REFUND_METHODS, type RefundMethod } from "@/types/return";

export default function ReturnDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const salesReturn = useAppSelector(selectReturnById(id));
  const authUser = useAppSelector(selectAuthUser);

  const [confirmGoodOpen, setConfirmGoodOpen] = useState(false);
  const [confirmDamagedOpen, setConfirmDamagedOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("Original payment method");

  if (!salesReturn) {
    return (
      <div>
        <PageHeader title="Return not found" backHref="/sales/returns" backLabel="Back to Returns" />
        <p className="text-sm text-ink-muted">
          This return may have been removed, or the link is out of date.{" "}
          <Link href="/sales/returns" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the returns list.
          </Link>
        </p>
      </div>
    );
  }

  const handleApproveGood = () => {
    dispatch(restockFromReturn({ productId: salesReturn.productId, variantId: salesReturn.variantId, quantity: salesReturn.quantity }));
    dispatch(
      addMovement({
        productId: salesReturn.productId,
        barcode: salesReturn.barcode,
        date: new Date().toISOString().slice(0, 10),
        type: "Sales Return",
        reference: salesReturn.returnNumber,
        quantity: salesReturn.quantity,
        balanceBefore: 0,
        balanceAfter: salesReturn.quantity,
        performedBy: authUser?.name ?? "Demo User",
        reason: `Return approved — good condition (${salesReturn.reason})`,
      }),
    );
    dispatch(setReturnInspection({ id: salesReturn.id, result: "good" }));
    setConfirmGoodOpen(false);
  };

  const handleApproveDamaged = () => {
    dispatch(markReturnedDamaged({ productId: salesReturn.productId, variantId: salesReturn.variantId, quantity: salesReturn.quantity }));
    dispatch(setReturnInspection({ id: salesReturn.id, result: "damaged" }));
    setConfirmDamagedOpen(false);
  };

  const handleReject = () => {
    dispatch(rejectReturn({ id: salesReturn.id }));
    setConfirmRejectOpen(false);
  };

  const handleIssueRefund = () => {
    dispatch(issueRefund({ id: salesReturn.id, method: refundMethod }));
    if (salesReturn.invoiceId) {
      dispatch(setInvoiceStatus({ id: salesReturn.invoiceId, status: "refunded" }));
    }
  };

  return (
    <div>
      <PageHeader
        title={salesReturn.returnNumber}
        subtitle={`Requested on ${formatDate(salesReturn.createdDate)} for ${salesReturn.invoiceNumber}`}
        backHref="/sales/returns"
        backLabel="Back to Returns"
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={salesReturn.status} />
        {salesReturn.inspectionResult && <StatusBadge status={salesReturn.inspectionResult} />}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-ink">Return Details</h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Customer</dt>
              <dd className="font-medium text-ink">{salesReturn.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Invoice</dt>
              <dd>
                {salesReturn.invoiceId ? (
                  <Link href={`/sales/invoices/${salesReturn.invoiceId}`} className="font-medium text-champagne-600 hover:text-champagne-700">
                    {salesReturn.invoiceNumber}
                  </Link>
                ) : (
                  <span className="font-medium text-ink">{salesReturn.invoiceNumber}</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Product</dt>
              <dd className="font-medium text-ink">
                {salesReturn.product} <span className="text-xs text-ink-muted">({salesReturn.barcode})</span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Return Quantity</dt>
              <dd className="font-medium text-ink">{salesReturn.quantity}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Reason</dt>
              <dd className="font-medium text-ink">{salesReturn.reason}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Refund Amount</dt>
              <dd className="text-lg font-semibold text-champagne-700">{formatCurrency(salesReturn.amount)}</dd>
            </div>
            {salesReturn.refundMethod && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Refund Method</dt>
                <dd className="font-medium text-ink">{salesReturn.refundMethod}</dd>
              </div>
            )}
            {salesReturn.notes && (
              <div className="col-span-full border-t border-glass-border pt-3">
                <dt className="mb-1 text-ink-muted">Notes</dt>
                <dd className="text-ink">{salesReturn.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-base font-semibold text-ink">Actions</h2>

          {salesReturn.status === "pending" && (
            <>
              <p className="text-xs text-ink-muted">Inspect the returned item to decide its stock impact.</p>
              <Button size="sm" onClick={() => setConfirmGoodOpen(true)}>
                <HiOutlineCheckCircle className="h-4 w-4" />
                Approve — Good Condition
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmDamagedOpen(true)}>
                <HiOutlineExclamationTriangle className="h-4 w-4" />
                Approve — Damaged
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmRejectOpen(true)} className="hover:bg-red-50 hover:text-red-600">
                <HiOutlineXCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}

          {salesReturn.status === "approved" && (
            <>
              <p className="text-xs text-ink-muted">
                Inspection recorded as <span className="font-medium text-ink">{salesReturn.inspectionResult}</span>. Issue the refund to complete this
                return.
              </p>
              <Select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value as RefundMethod)}>
                {REFUND_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
              <Button size="sm" onClick={handleIssueRefund}>
                <HiOutlineBanknotes className="h-4 w-4" />
                Issue Refund
              </Button>
            </>
          )}

          {salesReturn.status === "rejected" && <p className="text-sm text-ink-muted">This return was rejected. No stock or refund action was taken.</p>}
          {salesReturn.status === "refunded" && <p className="text-sm text-ink-muted">Refunded via {salesReturn.refundMethod}. This return is complete.</p>}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmGoodOpen}
        title="Approve as good condition?"
        description={`${salesReturn.quantity} unit(s) of ${salesReturn.product} will be added back to sellable stock.`}
        confirmLabel="Approve"
        onConfirm={handleApproveGood}
        onCancel={() => setConfirmGoodOpen(false)}
      />
      <ConfirmDialog
        open={confirmDamagedOpen}
        title="Approve as damaged?"
        description={`${salesReturn.quantity} unit(s) of ${salesReturn.product} will be moved to damaged stock, not sellable stock.`}
        confirmLabel="Approve"
        onConfirm={handleApproveDamaged}
        onCancel={() => setConfirmDamagedOpen(false)}
      />
      <ConfirmDialog
        open={confirmRejectOpen}
        title={`Reject ${salesReturn.returnNumber}?`}
        description="No stock or refund action will be taken."
        confirmLabel="Reject"
        onConfirm={handleReject}
        onCancel={() => setConfirmRejectOpen(false)}
      />
    </div>
  );
}
