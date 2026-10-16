"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { flatNavItems } from "@/lib/nav";
import { cn } from "@/lib/cn";

export function NavSearch({ className }: { className?: string }) {
  const router = useRouter();
  const items = useMemo(() => flatNavItems(), []);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const results = q
    ? items.filter((i) => i.label.toLowerCase().includes(q) || i.groupLabel?.toLowerCase().includes(q)).slice(0, 8)
    : [];

  const go = (href: string) => {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    router.push(href);
  };

  return (
    <div className={cn("relative", className)}>
      <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4.5 w-4.5 -translate-y-1/2 text-ink-muted" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="nav-search-results"
        aria-label="Jump to page"
        placeholder="Jump to a page…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && results[highlight]) {
            e.preventDefault();
            go(results[highlight].href);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="h-11 w-full rounded-xl border border-glass-border bg-white/60 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all focus:border-champagne-500 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
      />
      {open && q && (
        <ul
          id="nav-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-glass-border bg-cream-50 p-1.5 shadow-2xl"
        >
          {results.length === 0 && <li className="px-3 py-2.5 text-sm text-ink-muted">No pages match “{query}”.</li>}
          {results.map((item, index) => (
            <li key={item.href} role="option" aria-selected={index === highlight}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(item.href)}
                onMouseEnter={() => setHighlight(index)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                  index === highlight ? "bg-champagne-100 text-ink" : "text-ink",
                )}
              >
                <span className="font-medium">{item.label}</span>
                {item.groupLabel && <span className="text-xs text-ink-muted">{item.groupLabel}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
