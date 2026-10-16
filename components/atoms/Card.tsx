import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-glass-border bg-glass shadow-[0_8px_30px_-12px_rgba(43,36,29,0.15)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
