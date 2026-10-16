"use client";

import { usePathname } from "next/navigation";
import { HiChevronRight } from "react-icons/hi2";
import { findActiveNav } from "@/lib/nav";

export function Breadcrumb() {
  const pathname = usePathname();
  const active = findActiveNav(pathname);

  if (!active) return null;

  return (
    <div className="flex min-w-0 items-center gap-1.5 text-sm">
      {active.groupLabel && (
        <>
          <span className="hidden truncate text-ink-muted sm:inline">{active.groupLabel}</span>
          <HiChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-ink-muted sm:block" />
        </>
      )}
      <span className="truncate font-medium text-ink">{active.label}</span>
    </div>
  );
}
