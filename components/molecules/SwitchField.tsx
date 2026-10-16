"use client";

import { Switch } from "@/components/atoms/Switch";
import { cn } from "@/lib/cn";

export interface SwitchFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function SwitchField({ label, description, checked, onCheckedChange, className }: SwitchFieldProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 rounded-xl border border-glass-border bg-white/40 px-4 py-3", className)}>
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} label={label} />
    </div>
  );
}
