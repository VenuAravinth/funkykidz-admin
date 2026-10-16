import type { ReactNode } from "react";
import { Card } from "@/components/atoms/Card";
import { cn } from "@/lib/cn";

export interface StatTileProps {
  label: string;
  value: string;
  icon: ReactNode;
  hint?: string;
  tone?: "champagne" | "emerald" | "sky" | "rose" | string;
}

const toneStyles: Record<NonNullable<StatTileProps["tone"]>, string> = {
  champagne: "bg-champagne-100 text-champagne-600",
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  rose: "bg-rose-100 text-rose-700",
};

export function StatTile({ label, value, icon, hint, tone = "champagne" }: StatTileProps) {
  return (
    <Card className="flex min-w-0 flex-col gap-2 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="pt-0.5 text-sm font-medium leading-snug text-ink-muted">{label}</span>
        <div className={cn("hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex", toneStyles[tone])}>{icon}</div>
      </div>
      <span className="whitespace-nowrap text-xl font-semibold tracking-tight text-ink sm:text-2xl">{value}</span>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </Card>
  );
}
