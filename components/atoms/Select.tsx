import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { hasError = false, className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border bg-white/60 px-3.5 text-base text-ink sm:text-sm",
        "backdrop-blur-sm transition-all duration-150 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-champagne-500/60 focus:border-champagne-500 focus:bg-white/80",
        hasError ? "border-red-300 focus:ring-red-300/60 focus:border-red-400" : "border-glass-border",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
