import { formatCurrency } from "@/lib/format";
import { discountPercent } from "@/lib/pricing";
import { cn } from "@/lib/cn";

export interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: "sm" | "lg";
  className?: string;
}

export function PriceDisplay({ price, originalPrice, size = "sm", className }: PriceDisplayProps) {
  const discount = discountPercent(originalPrice, price);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      {discount > 0 && (
        <span className={cn("text-ink-muted line-through", size === "lg" ? "text-base" : "text-xs")}>
          {formatCurrency(originalPrice!)}
        </span>
      )}
      <span className={cn("font-semibold text-ink", size === "lg" ? "text-2xl" : "text-sm")}>{formatCurrency(price)}</span>
      {discount > 0 && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{discount}% OFF</span>
      )}
    </div>
  );
}
