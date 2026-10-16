import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
  neutral: "bg-ink/10 text-ink-muted",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}
