"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/molecules/Modal";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export interface AdjustStockTarget {
  label: string;
  barcode: string;
  available: number;
}

function AdjustStockForm({
  target,
  onClose,
  onSubmit,
}: {
  target: AdjustStockTarget;
  onClose: () => void;
  onSubmit: (stock: number, reason: string) => Promise<void> | void;
}) {
  const [value, setValue] = useState(String(target.available));
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ stock?: string; reason?: string }>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const stock = Number(value);
    const nextErrors: { stock?: string; reason?: string } = {};
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      nextErrors.stock = "Enter a whole number of 0 or more.";
    }
    if (!reason.trim()) {
      nextErrors.reason = "Enter a reason for this adjustment.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await onSubmit(stock, reason.trim());
      onClose();
    } catch (err) {
      setSaveError(typeof err === "string" ? err : err instanceof Error ? err.message : "Couldn't update stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {saveError && <FormAlert variant="error">{saveError}</FormAlert>}
      <FormField id="adjust-stock" label="Available stock" error={errors.stock} required>
        <Input
          id="adjust-stock"
          type="number"
          min="0"
          step="1"
          hasError={!!errors.stock}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      </FormField>
      <FormField id="adjust-reason" label="Reason" error={errors.reason} required>
        <Input
          id="adjust-reason"
          placeholder="e.g. Recount correction, damaged stock…"
          hasError={!!errors.reason}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </FormField>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          Save Adjustment
        </Button>
      </div>
    </form>
  );
}

export function AdjustStockModal({
  open,
  target,
  onClose,
  onSubmit,
}: {
  open: boolean;
  target?: AdjustStockTarget;
  onClose: () => void;
  onSubmit: (stock: number, reason: string) => Promise<void> | void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Adjust Stock" subtitle={target ? `${target.label} — ${target.barcode}` : undefined}>
      {target && <AdjustStockForm key={target.barcode} target={target} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}
