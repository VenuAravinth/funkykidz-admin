"use client";

import { useId, type ReactNode } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import { IconButton } from "@/components/atoms/IconButton";
import { useOverlay } from "@/components/molecules/Modal";

export interface DrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ open, title, subtitle, onClose, children }: DrawerProps) {
  const titleId = useId();
  useOverlay(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-dvh w-full flex-col bg-cream-50 shadow-2xl md:max-w-3xl md:rounded-l-2xl lg:max-w-4xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-glass-border px-5 py-4 sm:px-8 sm:py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-semibold text-ink">
              {title}
            </h2>
            {subtitle && <p className="mt-1 truncate text-sm text-ink-muted">{subtitle}</p>}
          </div>
          <IconButton label="Close" onClick={onClose} className="-mr-2">
            <HiOutlineXMark className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
