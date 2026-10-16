"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Select } from "@/components/atoms/Select";
import { Badge } from "@/components/atoms/Badge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatDateTime } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectActivityLogs } from "@/stores/slices/activityLogsSlice";
import type { ActivityLogModule } from "@/types/activityLog";

const MODULE_TONES: Record<ActivityLogModule, "success" | "warning" | "danger" | "info" | "neutral"> = {
  Sales: "info",
  Inventory: "warning",
  Purchase: "success",
  Finance: "neutral",
  Security: "danger",
};

function ActivityLogsContent() {
  const searchParams = useSearchParams();
  const userIdFilter = searchParams.get("userId") ?? "";
  const logs = useAppSelector(selectActivityLogs);

  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");

  const modules = Array.from(new Set(logs.map((l) => l.module)));

  const filtered = logs.filter((log) => {
    const matchesUser = !userIdFilter || log.userId === userIdFilter;
    const matchesQuery =
      !query ||
      log.action.toLowerCase().includes(query.toLowerCase()) ||
      log.userName.toLowerCase().includes(query.toLowerCase()) ||
      (log.reference ?? "").toLowerCase().includes(query.toLowerCase());
    const matchesModule = !moduleFilter || log.module === moduleFilter;
    return matchesUser && matchesQuery && matchesModule;
  });

  const filteredUserName = userIdFilter ? filtered[0]?.userName ?? logs.find((l) => l.userId === userIdFilter)?.userName : undefined;

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        subtitle={filteredUserName ? `Showing activity for ${filteredUserName}.` : "Who changed what, when, and from where."}
        actions={
          <>
            <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
              <option value="">All modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
            <SearchInput
              placeholder="Search by action, user, or reference…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </>
        }
      />

      <Table>
        <TableHead>
          <TableRow>
            <Th>Date/Time</Th>
            <Th>User</Th>
            <Th>Action</Th>
            <Th>Module</Th>
            <Th>Reference</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={5} message="No activity matches your filters." />}
          {filtered.map((log) => (
            <TableRow key={log.id}>
              <Td>{formatDateTime(log.dateTime)}</Td>
              <Td>{log.userName}</Td>
              <Td>
                <Link href={`/users-access/activity-logs/${log.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {log.action}
                </Link>
              </Td>
              <Td>
                <Badge tone={MODULE_TONES[log.module]}>{log.module}</Badge>
              </Td>
              <Td>{log.reference ?? "—"}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ActivityLogsPage() {
  return (
    <Suspense fallback={null}>
      <ActivityLogsContent />
    </Suspense>
  );
}
