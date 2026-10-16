"use client";

import { useState } from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import { IconButton } from "@/components/atoms/IconButton";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";

export interface DeleteButtonProps {
  itemLabel: string;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
  onDelete: () => void;
}

export function DeleteButton({ itemLabel, description, disabled, disabledReason, onDelete }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        label={`Delete ${itemLabel}`}
        title={disabled ? disabledReason : `Delete ${itemLabel}`}
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="hover:bg-red-50 hover:text-red-600"
      >
        <HiOutlineTrash className="h-4 w-4" />
      </IconButton>
      <ConfirmDialog
        open={open}
        title={`Delete ${itemLabel}?`}
        description={description ?? `This will permanently remove ${itemLabel}. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          onDelete();
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
