import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-champagne-500 to-champagne-600 text-white shadow-[0_8px_24px_-8px_rgba(203,161,91,0.65)] hover:shadow-[0_10px_28px_-6px_rgba(203,161,91,0.75)] hover:brightness-[1.03] active:brightness-95",
  secondary:
    "bg-white/70 text-ink border border-glass-border backdrop-blur-sm hover:bg-white/90",
  ghost: "bg-transparent text-ink-muted hover:text-ink hover:bg-white/40",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", isLoading = false, fullWidth = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {isLoading && <Spinner size={16} />}
      {children}
    </button>
  );
});
