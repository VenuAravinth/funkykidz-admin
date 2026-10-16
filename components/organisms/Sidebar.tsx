"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiSparkles, HiChevronDown, HiOutlineXMark } from "react-icons/hi2";
import { NAV_SECTIONS, findActiveNav, isNavGroup } from "@/lib/nav";
import { IconButton } from "@/components/atoms/IconButton";
import { cn } from "@/lib/cn";

export interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const active = findActiveNav(pathname);
  const [openGroup, setOpenGroup] = useState<string | null>(active?.groupLabel ?? null);

  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (active?.groupLabel) setOpenGroup(active.groupLabel);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onMobileClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      <div
        aria-hidden
        onClick={onMobileClose}
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(85vw,18rem)] flex-col border-r border-glass-border bg-cream-50 shadow-2xl transition-transform duration-200 ease-out",
          "lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:w-68 lg:shrink-0 lg:translate-x-0 lg:bg-cream-50/90 lg:shadow-none lg:backdrop-blur-md",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <Link href="/dashboard" onClick={onMobileClose} className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-champagne-500 to-champagne-600 text-white shadow-sm">
              <HiSparkles className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight text-ink">Funky Kids</span>
              <span className="text-xs text-ink-muted">Admin Console</span>
            </span>
          </Link>
          <IconButton label="Close menu" onClick={onMobileClose} className="lg:hidden">
            <HiOutlineXMark className="h-5 w-5" />
          </IconButton>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {NAV_SECTIONS.map((entry) => {
            const Icon = entry.icon;

            if (isNavGroup(entry)) {
              const groupActive = active?.groupLabel === entry.label;
              const isOpen = openGroup === entry.label;
              const panelId = `nav-group-${entry.label.replace(/\W+/g, "-").toLowerCase()}`;

              return (
                <div key={entry.label}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenGroup(isOpen ? null : entry.label)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      groupActive ? "bg-champagne-100 text-champagne-800" : "text-ink hover:bg-white/70",
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", groupActive ? "text-champagne-600" : "text-ink-muted")} />
                    <span className="flex-1 text-left">{entry.label}</span>
                    <HiChevronDown className={cn("h-4 w-4 shrink-0 text-ink-muted transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {isOpen && (
                    <div id={panelId} className="my-1 ml-5 space-y-0.5 border-l border-champagne-200 pl-3">
                      {entry.children.map((child) => {
                        const childActive = active?.href === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onMobileClose}
                            aria-current={childActive ? "page" : undefined}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors",
                              childActive
                                ? "bg-champagne-500 font-medium text-white shadow-sm"
                                : "text-ink-muted hover:bg-white/70 hover:text-ink",
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const leafActive = active?.href === entry.href;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onMobileClose}
                aria-current={leafActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  leafActive ? "bg-champagne-500 text-white shadow-sm" : "text-ink hover:bg-white/70",
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", !leafActive && "text-ink-muted")} />
                <span>{entry.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-glass-border px-5 py-4 text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} Funky Kids
        </div>
      </aside>
    </>
  );
}
