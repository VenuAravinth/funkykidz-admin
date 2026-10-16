import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FormAlertProps {
  variant: "error" | "success";
  children: ReactNode;
  className?: string;
}

export function FormAlert({ variant, children, className }: FormAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-medium",
        variant === "error" && "border-red-200 bg-red-50 text-red-600",
        variant === "success" && "border-champagne-300 bg-champagne-100/60 text-champagne-600",
        className,
      )}
    >
      {children}
    </div>
  );
}
