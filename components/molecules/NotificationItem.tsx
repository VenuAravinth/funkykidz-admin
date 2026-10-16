import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineXMark } from "react-icons/hi2";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format";
import type { NotificationSeverity } from "@/types/notification";
import type { NotificationWithReadState } from "@/lib/useNotifications";

const severityDotStyles: Record<NotificationSeverity, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  success: "bg-emerald-500",
  muted: "bg-ink/40",
};

export interface NotificationItemProps {
  notification: NotificationWithReadState;
  onOpen: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function NotificationItem({ notification, onOpen, onDismiss }: NotificationItemProps) {
  const router = useRouter();
  const { id, severity, title, message, meta, timestamp, href, actions, read } = notification;

  return (
    <div
      role={href ? "button" : undefined}
      tabIndex={href ? 0 : undefined}
      onClick={
        href
          ? () => {
              onOpen(id);
              router.push(href);
            }
          : undefined
      }
      onKeyDown={
        href
          ? (e) => {
              if (e.key === "Enter") {
                onOpen(id);
                router.push(href);
              }
            }
          : undefined
      }
      className={cn(
        "flex gap-3 rounded-xl px-3 py-3 transition-colors",
        read ? "bg-transparent" : "bg-champagne-50/70",
        href && "cursor-pointer hover:bg-white/60",
      )}
    >
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", severityDotStyles[severity])} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm leading-snug", read ? "font-medium text-ink" : "font-semibold text-ink")}>{title}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDismiss(id);
            }}
            className="shrink-0 text-ink-muted transition-colors hover:text-ink"
          >
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-0.5 text-sm text-ink-muted">{message}</p>

        {meta && meta.length > 0 && (
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {meta.map((entry) => (
              <div key={entry.label} className="flex items-baseline gap-1 text-xs">
                <dt className="text-ink-muted/80">{entry.label}:</dt>
                <dd className="font-medium text-ink">{entry.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-ink-muted">{timeAgo(timestamp)}</span>
          {actions.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(id);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    action.variant === "primary"
                      ? "bg-champagne-500 text-white hover:bg-champagne-600"
                      : "bg-white/70 text-ink border border-glass-border hover:bg-white/90",
                  )}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
