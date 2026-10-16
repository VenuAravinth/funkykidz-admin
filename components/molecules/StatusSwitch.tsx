"use client";

import { useState } from "react";
import { Switch } from "@/components/atoms/Switch";

export interface StatusSwitchProps {
  active: boolean;
  name: string;
  onChange?: (active: boolean) => unknown;
  onLabel?: string;
  offLabel?: string;
  disabled?: boolean;
}

export function StatusSwitch({ active, name, onChange, onLabel = "Active", offLabel = "Inactive", disabled }: StatusSwitchProps) {
  const [busy, setBusy] = useState(false);

  const toggle = async (next: boolean) => {
    if (!onChange) return;
    setBusy(true);
    try {
      await onChange(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Switch
      checked={active}
      onCheckedChange={toggle}
      busy={busy}
      disabled={disabled || !onChange}
      label={`${name}: ${active ? onLabel : offLabel}`}
      title={active ? onLabel : offLabel}
    />
  );
}
