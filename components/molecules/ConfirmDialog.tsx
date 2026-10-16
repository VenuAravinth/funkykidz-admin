"use client";

import { Button } from "@/components/atoms/Button";
import { useOverlay } from "@/components/molecules/Modal";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useOverlay(open, onCancel);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-glass-border bg-cream-50 p-6 shadow-2xl"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
