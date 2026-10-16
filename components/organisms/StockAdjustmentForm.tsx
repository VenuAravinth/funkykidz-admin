"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockAdjustmentSchema, type StockAdjustmentInput } from "@/features/stock-adjustments/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { adjustmentRequiresApproval } from "@/lib/stockAdjustment";
import { adjustmentReasons } from "@/types/stockAdjustment";
import { cn } from "@/lib/cn";
import type { StockRow } from "@/lib/stockRows";

const emptyValues: StockAdjustmentInput = { rowKey: "", physicalStock: 0, reason: "Damaged", notes: "" };

export function StockAdjustmentForm({
  rows,
  requestedBy,
  onSubmit,
}: {
  rows: StockRow[];
  requestedBy: string;
  onSubmit: (row: StockRow, input: StockAdjustmentInput) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockAdjustmentInput>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: emptyValues,
  });

  const rowKey = useWatch({ control, name: "rowKey" });
  const physicalStock = useWatch({ control, name: "physicalStock" });
  const selectedRow = rows.find((r) => r.key === rowKey);

  const difference = selectedRow ? physicalStock - selectedRow.available : 0;
  const needsApproval = selectedRow ? adjustmentRequiresApproval(selectedRow.available, difference) : false;

  const submit = handleSubmit((input) => {
    if (!selectedRow) return;
    onSubmit(selectedRow, input);
    reset(emptyValues);
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FormField id="rowKey" label="Product" error={errors.rowKey?.message} required>
        <Select id="rowKey" hasError={!!errors.rowKey} {...register("rowKey")}>
          <option value="">Select product…</option>
          {rows.map((r) => (
            <option key={r.key} value={r.key}>
              {r.name} — {r.color} · {r.size} ({r.barcode})
            </option>
          ))}
        </Select>
      </FormField>

      {selectedRow && (
        <div className="grid grid-cols-1 gap-5 rounded-xl border border-glass-border bg-white/40 p-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-muted">Current System Stock</span>
            <span className="text-2xl font-semibold text-ink">{selectedRow.available}</span>
          </div>

          <FormField id="physicalStock" label="Actual Physical Stock" error={errors.physicalStock?.message} required>
            <Input
              id="physicalStock"
              type="number"
              min="0"
              step="1"
              hasError={!!errors.physicalStock}
              {...register("physicalStock", { valueAsNumber: true })}
            />
          </FormField>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-muted">Difference</span>
            <span
              className={cn(
                "text-2xl font-semibold",
                difference > 0 ? "text-emerald-600" : difference < 0 ? "text-red-600" : "text-ink",
              )}
            >
              {difference > 0 ? `+${difference}` : difference}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="reason" label="Reason" error={errors.reason?.message} required>
          <Select id="reason" hasError={!!errors.reason} {...register("reason")}>
            {adjustmentReasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Requested by</span>
          <span className="flex h-11 items-center text-sm text-ink-muted">{requestedBy} · date &amp; time logged automatically</span>
        </div>
      </div>

      <FormField id="notes" label="Notes" error={errors.notes?.message} required>
        <textarea
          id="notes"
          rows={3}
          placeholder="e.g. 3 pieces damaged during storage"
          className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
          {...register("notes")}
        />
      </FormField>

      {selectedRow && needsApproval && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          This is a large adjustment ({difference > 0 ? `+${difference}` : difference} units
          {selectedRow.available > 0 ? `, ${Math.round((Math.abs(difference) / selectedRow.available) * 100)}% of system stock` : ""}
          ). It will be submitted for manager approval and won&apos;t change stock until approved.
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => reset(emptyValues)}>
          Cancel
        </Button>
        <Button type="submit">Submit Adjustment</Button>
      </div>
    </form>
  );
}
