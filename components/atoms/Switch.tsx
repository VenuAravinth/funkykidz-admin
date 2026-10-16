"use client";

import { cn } from "@/lib/cn";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  busy?: boolean;
  title?: string;
  className?: string;
}

export function Switch({ checked, onCheckedChange, label, disabled, busy, title, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={busy || undefined}
      title={title ?? label}
      disabled={disabled || busy}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-champagne-500" : "bg-ink/15",
        busy && "animate-pulse",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-5.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
