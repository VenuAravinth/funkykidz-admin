"use client";

import { useMemo, useState } from "react";
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { NotificationItem } from "@/components/molecules/NotificationItem";
import { cn } from "@/lib/cn";
import { useAppDispatch } from "@/stores/hooks";
import { markRead, markAllRead, dismiss } from "@/stores/slices/notificationsUiSlice";
import { useNotifications } from "@/lib/useNotifications";
import { NOTIFICATION_CATEGORY_LABELS, type NotificationCategory } from "@/types/notification";

const CATEGORIES = Object.keys(NOTIFICATION_CATEGORY_LABELS) as NotificationCategory[];

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const notifications = useNotifications();
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const criticalCount = useMemo(() => notifications.filter((n) => n.severity === "critical").length, [notifications]);
  const presentCategories = useMemo(() => new Set(notifications.map((n) => n.category)), [notifications]);

  const visible = useMemo(
    () =>
      notifications
        .filter((n) => activeCategory === "all" || n.category === activeCategory)
        .filter((n) => !showUnreadOnly || !n.read),
    [notifications, activeCategory, showUnreadOnly],
  );

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Everything across low stock, purchase orders, payments, and orders that needs your attention."
        actions={
          <Button variant="secondary" size="sm" onClick={() => dispatch(markAllRead(notifications.map((n) => n.id)))} disabled={unreadCount === 0}>
            <HiOutlineCheckCircle className="h-4 w-4" />
            Mark all as read
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile label="Unread" value={String(unreadCount)} icon={<HiOutlineBell className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Critical / Overdue" value={String(criticalCount)} icon={<HiOutlineExclamationTriangle className="h-5 w-5" />} tone="rose" />
        <StatTile label="Total" value={String(notifications.length)} icon={<HiOutlineCheckCircle className="h-5 w-5" />} tone="sky" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            activeCategory === "all" ? "bg-champagne-500 text-white shadow-sm" : "bg-white/60 text-ink-muted hover:bg-white/90",
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
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              activeCategory === category ? "bg-champagne-500 text-white shadow-sm" : "bg-white/60 text-ink-muted hover:bg-white/90",
            )}
          >
            {NOTIFICATION_CATEGORY_LABELS[category]}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowUnreadOnly((v) => !v)}
          className={cn(
            "ml-auto rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            showUnreadOnly
              ? "border-champagne-500 bg-champagne-100 text-champagne-700"
              : "border-glass-border bg-white/60 text-ink-muted hover:bg-white/90",
          )}
        >
          Unread only
        </button>
      </div>

      <Card className="divide-y divide-glass-border p-2">
        {visible.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-ink-muted">
            {notifications.length === 0 ? "You're all caught up — nothing here." : "No notifications match this filter."}
          </p>
        )}
        {visible.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onOpen={(id) => dispatch(markRead(id))}
            onDismiss={(id) => dispatch(dismiss(id))}
          />
        ))}
      </Card>
    </div>
  );
}
