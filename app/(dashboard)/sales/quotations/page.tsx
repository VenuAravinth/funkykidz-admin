"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlinePlus, HiOutlineEye, HiOutlinePencil } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { QuotationActions } from "@/components/organisms/QuotationActions";
import { formatCurrency, formatDate } from "@/lib/format";
import { quotationTotal } from "@/lib/dummy-data/quotations";
import { useAppSelector } from "@/stores/hooks";
import { selectQuotations } from "@/stores/slices/quotationsSlice";
import type { QuotationStatus } from "@/types/quotation";

const STATUS_TABS: { label: string; value: QuotationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Viewed", value: "viewed" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
];

function QuotationsListContent() {
  const searchParams = useSearchParams();
  const activeStatus = (searchParams.get("status") as QuotationStatus | "all" | null) ?? "all";
  const allQuotations = useAppSelector(selectQuotations);

  const filtered = activeStatus === "all" ? allQuotations : allQuotations.filter((q) => q.status === activeStatus);

  const countFor = (value: QuotationStatus | "all") =>
    value === "all" ? allQuotations.length : allQuotations.filter((q) => q.status === value).length;

  const tabs = STATUS_TABS.map((tab) => ({
    label: tab.label,
    href: `/sales/quotations?status=${tab.value}`,
    active: activeStatus === tab.value,
    count: countFor(tab.value),
  }));

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle="A formal price offer to the customer."
        actions={
          <Link href="/sales/quotations/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Create Quotation
            </Button>
          </Link>
        }
      />

      <div className="mb-5">
        <SegmentedTabs tabs={tabs} />
      </div>

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Quotation Number</Th>
            <Th>Customer</Th>
            <Th>Date</Th>
            <Th>Valid Until</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Salesperson</Th>
            <Th>Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={8} message="No quotations found." />}
          {filtered.map((q) => (
            <TableRow key={q.id}>
              <Td>
                <Link href={`/sales/quotations/${q.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {q.quotationNumber}
                </Link>
              </Td>
              <Td>{q.customerName}</Td>
              <Td>{formatDate(q.createdDate)}</Td>
              <Td>{formatDate(q.validUntil)}</Td>
              <Td>{formatCurrency(quotationTotal(q))}</Td>
              <Td>
                <StatusBadge status={q.status} />
              </Td>
              <Td>{q.salesperson}</Td>
              <Td>
                <div className="flex items-center gap-1">
                  <Link href={`/sales/quotations/${q.id}`}>
                    <IconButton label="View" title="View">
                      <HiOutlineEye className="h-4 w-4" />
                    </IconButton>
                  </Link>
                  <Link href={`/sales/quotations/${q.id}/edit`}>
                    <IconButton label="Edit" title="Edit">
                      <HiOutlinePencil className="h-4 w-4" />
                    </IconButton>
                  </Link>
                  <QuotationActions quotation={q} compact />
                </div>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function QuotationsListPage() {
  return (
    <Suspense fallback={null}>
      <QuotationsListContent />
    </Suspense>
  );
}
