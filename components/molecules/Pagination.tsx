"use client";

import { useRef } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import { PAGE_SIZE_OPTIONS, type PaginationState } from "@/lib/usePagination";
import { cn } from "@/lib/cn";

function pageList(page: number, pageCount: number): Array<number | "gap"> {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(p - sorted[i - 1] === 2 ? p - 1 : "gap");
    out.push(p);
  });
  return out;
}

const navBase =
  "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-full border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const navButton = `${navBase} border-glass-border bg-white/60 text-ink hover:bg-white`;
const navActive = `${navBase} border-champagne-500 bg-champagne-500 text-white shadow-sm`;

export interface PaginationProps {
  state: PaginationState;
  label?: string;
  className?: string;
}

export function Pagination({ state, label = "records", className }: PaginationProps) {
  const rootRef = useRef<HTMLElement>(null);
  const { page, pageCount, pageSize, total, start, end, setPage, setPageSize } = state;

  if (total <= PAGE_SIZE_OPTIONS[0]) return null;

  const goTo = (next: number) => {
    setPage(next);
    const table = rootRef.current?.closest<HTMLElement>("[data-paginated]");
    if (table && table.getBoundingClientRect().top < 80) table.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return (
    <nav
      ref={rootRef}
      aria-label="Pagination"
      className={cn("flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm text-ink-muted sm:justify-start">
        <span aria-live="polite">
          Showing <span className="font-medium text-ink">{start + 1}–{end}</span> of{" "}
          <span className="font-medium text-ink">{total}</span> {label}
        </span>
        <label className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-10 rounded-xl border border-glass-border bg-white/60 px-3 text-base text-ink focus:border-champagne-500 focus:outline-none focus:ring-2 focus:ring-champagne-500/60 sm:text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-1.5 sm:justify-end">
        <button type="button" className={navButton} onClick={() => goTo(page - 1)} disabled={page === 1} aria-label="Previous page">
          <HiOutlineChevronLeft className="h-4 w-4" />
          <span className="sm:hidden">Prev</span>
        </button>

        <span className="text-sm text-ink-muted sm:hidden">
          Page <span className="font-medium text-ink">{page}</span> of {pageCount}
        </span>
        <div className="hidden items-center gap-1.5 sm:flex">
          {pageList(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-ink-muted" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goTo(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={p === page ? navActive : navButton}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button type="button" className={navButton} onClick={() => goTo(page + 1)} disabled={page === pageCount} aria-label="Next page">
          <span className="sm:hidden">Next</span>
          <HiOutlineChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
