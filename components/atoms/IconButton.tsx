import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className, type = "button", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        "hover:bg-white/70 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-500/60 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
});
