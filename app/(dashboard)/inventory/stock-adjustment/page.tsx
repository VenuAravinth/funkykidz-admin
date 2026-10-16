"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { StockAdjustmentForm } from "@/components/organisms/StockAdjustmentForm";
import { formatDateTime } from "@/lib/format";
import { buildStockRows } from "@/lib/stockRows";
import { adjustmentRequiresApproval } from "@/lib/stockAdjustment";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectProducts } from "@/stores/slices/catalogSlice";
import { adjustProductStock } from "@/features/products/api";
import { selectAuthUser } from "@/stores/slices/authSlice";
import { addMovement } from "@/stores/slices/stockMovementsSlice";
import {
  addAdjustment,
  approveAdjustment,
  rejectAdjustment,
  selectStockAdjustments,
} from "@/stores/slices/stockAdjustmentsSlice";
import type { StockAdjustmentInput } from "@/features/stock-adjustments/schema";
import type { AdjustmentStatus, StockAdjustment } from "@/types/stockAdjustment";
import type { StockRow } from "@/lib/stockRows";

const STATUS_META: Record<AdjustmentStatus, { label: string; tone: "success" | "warning" | "danger" }> = {
  approved: { label: "Approved", tone: "success" },
  pending: { label: "Pending Approval", tone: "warning" },
  rejected: { label: "Rejected", tone: "danger" },
};

const BACKEND_REASON: Partial<Record<string, "damaged" | "count" | "correction">> = {
  Damaged: "damaged",
  Expired: "damaged",
  "Counting Mistake": "count",
  "Opening Stock": "count",
};

interface ApplyToStockInput {
  productId: string;
  variantId?: string;
  barcode: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  reason: string;
  notes: string;
  performedBy: string;
}

export default function StockAdjustmentPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const authUser = useAppSelector(selectAuthUser);
  const adjustments = useAppSelector(selectStockAdjustments);

  const rows = useMemo(() => buildStockRows(products), [products]);
  const [stockError, setStockError] = useState<string | null>(null);
  const requestedBy = authUser?.name ?? "System";

  const applyToStock = async (input: ApplyToStockInput) => {
    if (!input.variantId) return;
    setStockError(null);
    try {
      await dispatch(
        adjustProductStock({
          id: input.productId,
          input: {
            reason: BACKEND_REASON[input.reason] ?? "correction",
            note: `${input.reason} — ${input.notes}`.slice(0, 300),
            adjustments: [{ variantId: input.variantId, set: input.physicalStock }],
          },
        }),
      ).unwrap();
    } catch (err) {
      setStockError(typeof err === "string" ? err : "Couldn't update stock.");
      return;
    }
    dispatch(
      addMovement({
        productId: input.productId,
        barcode: input.barcode,
        date: new Date().toISOString().slice(0, 10),
        type: "Stock Adjustment",
        reference: `SA-${Date.now().toString(36).toUpperCase()}`,
        quantity: input.difference,
        balanceBefore: input.systemStock,
        balanceAfter: input.physicalStock,
        performedBy: input.performedBy,
        reason: `${input.reason} — ${input.notes}`,
      }),
    );
  };

  const handleFormSubmit = (row: StockRow, input: StockAdjustmentInput) => {
    const difference = input.physicalStock - row.available;
    const requiresApproval = adjustmentRequiresApproval(row.available, difference);

    dispatch(
      addAdjustment({
        productId: row.productId,
        variantId: row.variantId,
        barcode: row.barcode,
        productName: row.name,
        systemStock: row.available,
        physicalStock: input.physicalStock,
        difference,
        reason: input.reason,
        notes: input.notes,
        requestedBy,
        requestedAt: new Date().toISOString(),
        requiresApproval,
      }),
    );

    if (!requiresApproval) {
      applyToStock({
        productId: row.productId,
        variantId: row.variantId,
        barcode: row.barcode,
        systemStock: row.available,
        physicalStock: input.physicalStock,
        difference,
        reason: input.reason,
        notes: input.notes,
        performedBy: requestedBy,
      });
    }
  };

  const handleApprove = (adjustment: StockAdjustment) => {
    dispatch(approveAdjustment({ id: adjustment.id, approvedBy: requestedBy }));
    applyToStock({
      productId: adjustment.productId,
      variantId: adjustment.variantId,
      barcode: adjustment.barcode,
      systemStock: adjustment.systemStock,
      physicalStock: adjustment.physicalStock,
      difference: adjustment.difference,
      reason: adjustment.reason,
      notes: adjustment.notes,
      performedBy: requestedBy,
    });
  };

  const handleReject = (adjustment: StockAdjustment) => {
    dispatch(rejectAdjustment({ id: adjustment.id, approvedBy: requestedBy }));
  };

  const sortedAdjustments = [...adjustments].sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));

  return (
    <div>
      <PageHeader
        title="Stock Adjustment"
        subtitle="Reconcile physical counts against system stock."
        backHref="/inventory"
        backLabel="Inventory"
      />

      {stockError && (
        <FormAlert variant="error" className="mb-4">
          {stockError}
        </FormAlert>
      )}

      <Card className="mb-6 p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">New Adjustment</h2>
        <StockAdjustmentForm rows={rows} requestedBy={requestedBy} onSubmit={handleFormSubmit} />
      </Card>

      <h2 className="mb-3 text-base font-semibold text-ink">Adjustment History</h2>
      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Requested</Th>
            <Th>Product</Th>
            <Th>Barcode</Th>
            <Th>System</Th>
            <Th>Physical</Th>
            <Th>Difference</Th>
            <Th>Reason</Th>
            <Th>Notes</Th>
            <Th>By</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedAdjustments.length === 0 && <TableEmpty colSpan={11} message="No stock adjustments recorded yet." />}
          {sortedAdjustments.map((adjustment) => {
            const meta = STATUS_META[adjustment.status];
            return (
              <TableRow key={adjustment.id}>
                <Td className="text-ink-muted">{formatDateTime(adjustment.requestedAt)}</Td>
                <Td className="font-medium text-ink">{adjustment.productName}</Td>
                <Td className="font-mono text-xs text-ink-muted">{adjustment.barcode}</Td>
                <Td>{adjustment.systemStock}</Td>
                <Td>{adjustment.physicalStock}</Td>
                <Td className={adjustment.difference > 0 ? "font-medium text-emerald-600" : adjustment.difference < 0 ? "font-medium text-red-600" : ""}>
                  {adjustment.difference > 0 ? `+${adjustment.difference}` : adjustment.difference}
                </Td>
                <Td>{adjustment.reason}</Td>
                <Td className="max-w-xs !whitespace-normal text-ink-muted">{adjustment.notes}</Td>
                <Td>{adjustment.requestedBy}</Td>
                <Td>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  {adjustment.status !== "pending" && adjustment.approvedBy && (
                    <div className="mt-1 text-xs text-ink-muted">by {adjustment.approvedBy}</div>
                  )}
                </Td>
                <Td className="text-right">
                  {adjustment.status === "pending" && (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleReject(adjustment)}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(adjustment)}>
                        Approve
                      </Button>
                    </div>
                  )}
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
