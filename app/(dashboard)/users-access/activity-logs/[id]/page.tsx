"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { formatDateTime } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectActivityLogById } from "@/stores/slices/activityLogsSlice";

export default function ActivityLogDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const log = useAppSelector((state) => selectActivityLogById(state, id));

  if (!log) {
    return (
      <div>
        <PageHeader title="Activity not found" backHref="/users-access/activity-logs" backLabel="Back to Activity Logs" />
        <p className="text-sm text-ink-muted">
          <Link href="/users-access/activity-logs" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the activity log.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Activity Details" backHref="/users-access/activity-logs" backLabel="Back to Activity Logs" />

      <Card className="max-w-2xl p-6">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">User</dt>
            <dd className="font-medium text-ink">{log.userName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Action</dt>
            <dd className="font-medium text-ink">{log.action}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Date</dt>
            <dd className="font-medium text-ink">{formatDateTime(log.dateTime)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Module</dt>
            <dd>
              <Badge tone="info">{log.module}</Badge>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Reference</dt>
            <dd className="font-medium text-ink">{log.reference ?? "—"}</dd>
          </div>

          {log.detail?.product && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Product</dt>
              <dd className="font-medium text-ink">{log.detail.product}</dd>
            </div>
          )}
          {log.detail?.before && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Before</dt>
              <dd className="font-medium text-ink">{log.detail.before}</dd>
            </div>
          )}
          {log.detail?.after && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">After</dt>
              <dd className="font-medium text-ink">{log.detail.after}</dd>
            </div>
          )}
          {log.detail?.difference && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Difference</dt>
              <dd className="font-medium text-ink">{log.detail.difference}</dd>
            </div>
          )}
          {log.detail?.reason && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Reason</dt>
              <dd className="font-medium text-ink">{log.detail.reason}</dd>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">IP / Device</dt>
            <dd className="font-medium text-ink">{log.device ?? "—"}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
