import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 cursor-pointer rounded border-glass-border text-champagne-600",
        "accent-champagne-600 focus:outline-none focus:ring-2 focus:ring-champagne-500/60 focus:ring-offset-1",
        className,
      )}
      {...props}
    />
  );
});
