"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlinePlus } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { estimationTotal, estimationItemCount } from "@/lib/dummy-data/estimations";
import { useAppSelector } from "@/stores/hooks";
import { selectEstimations } from "@/stores/slices/estimationsSlice";
import type { EstimationStatus } from "@/types/estimation";

const STATUS_TABS: { label: string; value: EstimationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Viewed", value: "viewed" },
  { label: "Converted", value: "converted" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
];

function EstimationsListContent() {
  const searchParams = useSearchParams();
  const activeStatus = (searchParams.get("status") as EstimationStatus | "all" | null) ?? "all";
  const allEstimations = useAppSelector(selectEstimations);

  const filtered = activeStatus === "all" ? allEstimations : allEstimations.filter((e) => e.status === activeStatus);

  const countFor = (value: EstimationStatus | "all") =>
    value === "all" ? allEstimations.length : allEstimations.filter((e) => e.status === value).length;

  const tabs = STATUS_TABS.map((tab) => ({
    label: tab.label,
    href: `/sales/estimations?status=${tab.value}`,
    active: activeStatus === tab.value,
    count: countFor(tab.value),
  }));

  return (
    <div>
      <PageHeader
        title="Estimations"
        subtitle="Approximate quotes for customers, ready to convert into a quotation."
        actions={
          <Link href="/sales/estimations/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Create Estimation
            </Button>
          </Link>
        }
      />

      <div className="mb-5">
        <SegmentedTabs tabs={tabs} />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Estimation</Th>
            <Th>Customer</Th>
            <Th>Date</Th>
            <Th>Items</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={6} message="No estimations found." />}
          {filtered.map((e) => (
            <TableRow key={e.id}>
              <Td>
                <Link href={`/sales/estimations/${e.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {e.estimationNumber}
                </Link>
              </Td>
              <Td>{e.customerName}</Td>
              <Td>{formatDate(e.createdDate)}</Td>
              <Td>{estimationItemCount(e)}</Td>
              <Td>{formatCurrency(estimationTotal(e))}</Td>
              <Td>
                <StatusBadge status={e.status} />
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function EstimationsListPage() {
  return (
    <Suspense fallback={null}>
      <EstimationsListContent />
    </Suspense>
  );
}
