"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

export interface SegmentedTab {
  label: string;
  href: string;
  active: boolean;
  count?: number;
}

export function SegmentedTabs({ tabs }: { tabs: SegmentedTab[] }) {
  return (
    <div className="flex w-full gap-1.5 overflow-x-auto rounded-full border border-glass-border bg-white/50 p-1.5 backdrop-blur-sm [scrollbar-width:none]">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
            tab.active ? "bg-champagne-500 text-white shadow-sm" : "text-ink-muted hover:bg-white/70 hover:text-ink",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                tab.active ? "bg-white/25 text-white" : "bg-ink/10 text-ink-muted",
              )}
            >
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
