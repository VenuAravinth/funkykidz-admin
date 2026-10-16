import type { ReactNode } from "react";
import { Label } from "@/components/atoms/Label";
import { cn } from "@/lib/cn";

export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  size?: "md" | "lg";
  className?: string;
  children: ReactNode;
}

export function FormField({ id, label, error, required, size = "md", className, children }: FormFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={cn("flex flex-col", size === "lg" ? "gap-2" : "gap-1.5", className)}>
      <Label htmlFor={id} className={size === "lg" ? "text-[15px] sm:text-base" : undefined}>
        {label}
        {required && <span className="text-champagne-600"> *</span>}
      </Label>
      {children}
      {error && (
        <p id={errorId} role="alert" className={cn("font-medium text-red-500", size === "lg" ? "text-sm" : "text-xs")}>
          {error}
        </p>
      )}
    </div>
  );
}
