"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { HiOutlineBell, HiOutlineCheckCircle } from "react-icons/hi2";
import { cn } from "@/lib/cn";
import { useAppDispatch } from "@/stores/hooks";
import { markRead, markAllRead, dismiss } from "@/stores/slices/notificationsUiSlice";
import { useNotifications } from "@/lib/useNotifications";
import { NotificationItem } from "@/components/molecules/NotificationItem";
import { NOTIFICATION_CATEGORY_LABELS, type NotificationCategory } from "@/types/notification";

const CATEGORIES = Object.keys(NOTIFICATION_CATEGORY_LABELS) as NotificationCategory[];

export function NotificationCenter() {
  const dispatch = useAppDispatch();
  const notifications = useNotifications();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | "all">("all");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const visible = useMemo(
    () => (activeCategory === "all" ? notifications : notifications.filter((n) => n.category === activeCategory)),
    [notifications, activeCategory],
  );

  const presentCategories = useMemo(() => new Set(notifications.map((n) => n.category)), [notifications]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-white/60 hover:text-ink"
      >
        <HiOutlineBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[4.5rem] z-50 overflow-hidden sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[26rem] rounded-2xl border border-glass-border bg-cream-50 shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-glass-border px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">Notifications</h3>
            <button
              type="button"
              onClick={() => dispatch(markAllRead(notifications.map((n) => n.id)))}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1 text-xs font-medium text-champagne-600 transition-colors hover:text-champagne-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiOutlineCheckCircle className="h-4 w-4" />
              Mark all as read
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 border-b border-glass-border px-3 py-2">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeCategory === "all" ? "bg-champagne-500 text-white" : "bg-white/60 text-ink-muted hover:bg-white/90",
              )}
            >
              All
            </button>
            {CATEGORIES.filter((c) => presentCategories.has(c)).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  activeCategory === category ? "bg-champagne-500 text-white" : "bg-white/60 text-ink-muted hover:bg-white/90",
                )}
              >
                {NOTIFICATION_CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>

          <div className="max-h-[min(28rem,60dvh)] overflow-y-auto p-2">
            {visible.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-ink-muted">You&apos;re all caught up — nothing here.</p>
            )}
            {visible.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={(id) => dispatch(markRead(id))}
                onDismiss={(id) => dispatch(dismiss(id))}
              />
            ))}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-glass-border px-4 py-3 text-center text-sm font-medium text-champagne-600 transition-colors hover:bg-white/60 hover:text-champagne-700"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
