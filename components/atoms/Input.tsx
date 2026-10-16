import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  inputSize?: "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError = false, inputSize = "md", className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border bg-white/60 px-4 text-base text-ink placeholder:text-ink-muted/70",
        inputSize === "lg" ? "h-12 sm:h-13 sm:text-[17px]" : "h-11 sm:text-sm",
        "backdrop-blur-sm transition-all duration-150 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-champagne-500/60 focus:border-champagne-500 focus:bg-white/80",
        hasError ? "border-red-300 focus:ring-red-300/60 focus:border-red-400" : "border-glass-border",
        className,
      )}
      {...props}
    />
  );
});
