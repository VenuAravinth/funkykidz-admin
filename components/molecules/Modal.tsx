"use client";

import { useEffect, useId, type ReactNode } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import { IconButton } from "@/components/atoms/IconButton";
import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
};

export function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
}

export function Modal({ open, title, subtitle, onClose, children, size = "md" }: ModalProps) {
  const titleId = useId();
  useOverlay(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-glass-border bg-cream-50 shadow-2xl sm:max-h-[88dvh] sm:rounded-2xl",
          sizeStyles[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-glass-border px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          </div>
          <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-1">
            <HiOutlineXMark className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
}
