"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { HiOutlineReceiptPercent, HiOutlineDocumentText } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { ComingSoon } from "@/components/molecules/ComingSoon";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { BreakdownBarChart } from "@/components/organisms/charts/BreakdownBarChart";
import { formatCurrency, formatDate } from "@/lib/format";
import { purchaseOrders } from "@/lib/dummy-data/suppliers";
import { computeGstSummary, computeSalesByRate, computePurchasesByRate, computeGstByInvoice, type TaxRateRow } from "@/lib/taxReports";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoices } from "@/stores/slices/invoicesSlice";

const TABS = [
  { label: "GST Summary", value: "summary" },
  { label: "Sales GST (Output)", value: "sales" },
  { label: "Purchase GST (Input)", value: "purchase" },
  { label: "GST by Invoice", value: "invoice" },
  { label: "GST Rates", value: "rates" },
  { label: "Credit / Debit Notes", value: "notes" },
] as const;

type ReportType = (typeof TABS)[number]["value"];

function RateTable({ rows, taxLabel }: { rows: TaxRateRow[]; taxLabel: string }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Tax Rate</Th>
          <Th>Taxable Amount</Th>
          <Th>{taxLabel}</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={3} message="No records in this period." />}
        {rows.map((r) => (
          <TableRow key={r.rate}>
            <Td className="font-medium text-ink">{r.rate}%</Td>
            <Td>{formatCurrency(r.taxableAmount)}</Td>
            <Td>{formatCurrency(r.taxAmount)}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function GstReportsContent() {
  const searchParams = useSearchParams();
  const activeType = (searchParams.get("type") as ReportType | null) ?? "summary";

  const invoices = useAppSelector(selectInvoices);
  const summary = useMemo(() => computeGstSummary(invoices), [invoices]);
  const salesByRate = useMemo(() => computeSalesByRate(invoices), [invoices]);
  const purchasesByRate = useMemo(() => computePurchasesByRate(purchaseOrders), []);
  const gstByInvoice = useMemo(() => computeGstByInvoice(invoices), [invoices]);
  const allRates = useMemo(
    () => [...new Set([...salesByRate.map((r) => r.rate), ...purchasesByRate.map((r) => r.rate)])].sort((a, b) => a - b),
    [salesByRate, purchasesByRate],
  );

  const tabs = TABS.map((t) => ({ label: t.label, href: `/reports/gst?type=${t.value}`, active: activeType === t.value }));

  return (
    <div>
      <PageHeader title="GST Reports" subtitle="Taxable sales, CGST/SGST, and GST collected vs. paid." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Taxable Sales" value={formatCurrency(summary.taxableSales)} icon={<HiOutlineReceiptPercent className="h-5 w-5" />} tone="champagne" />
        <StatTile label="CGST" value={formatCurrency(summary.cgst)} icon={<HiOutlineReceiptPercent className="h-5 w-5" />} tone="sky" />
        <StatTile label="SGST" value={formatCurrency(summary.sgst)} icon={<HiOutlineReceiptPercent className="h-5 w-5" />} tone="sky" />
        <StatTile label="Total GST Collected" value={formatCurrency(summary.totalGstCollected)} icon={<HiOutlineReceiptPercent className="h-5 w-5" />} tone="emerald" />
      </div>

      <div className="mb-6">
        <SegmentedTabs tabs={tabs} />
      </div>

      {activeType === "summary" && (
        <Card className="p-6">
          <BreakdownBarChart data={salesByRate.map((r) => ({ name: `${r.rate}%`, value: r.taxAmount }))} seriesName="GST Collected" />
        </Card>
      )}
      {activeType === "sales" && <RateTable rows={salesByRate} taxLabel="GST Collected (Output)" />}
      {activeType === "purchase" && <RateTable rows={purchasesByRate} taxLabel="GST Paid (Input)" />}
      {activeType === "invoice" && (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Invoice</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th>Taxable Amount</Th>
              <Th>Rate</Th>
              <Th>GST Amount</Th>
              <Th>Total</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {gstByInvoice.length === 0 && <TableEmpty colSpan={7} message="No invoices recorded." />}
            {gstByInvoice.map((r) => (
              <TableRow key={r.invoiceNumber}>
                <Td className="font-medium text-ink">{r.invoiceNumber}</Td>
                <Td>{r.customerName}</Td>
                <Td>{formatDate(r.date)}</Td>
                <Td>{formatCurrency(r.taxableAmount)}</Td>
                <Td>{r.gstPercent}%</Td>
                <Td>{formatCurrency(r.gstAmount)}</Td>
                <Td className="font-medium">{formatCurrency(r.total)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {activeType === "rates" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-muted">
            Tax rates are set per invoice and purchase order line, not hardcoded — these are the rates currently in use across the business.
          </p>
          <div className="flex flex-wrap gap-2">
            {allRates.length === 0 && <span className="text-sm text-ink-muted">No rates recorded yet.</span>}
            {allRates.map((rate) => (
              <span key={rate} className="rounded-full bg-champagne-100 px-4 py-2 text-sm font-medium text-champagne-700">
                {rate}%
              </span>
            ))}
          </div>
        </div>
      )}
      {activeType === "notes" && (
        <ComingSoon icon={HiOutlineDocumentText} message="Credit and debit notes aren't tracked as their own documents yet — only sales returns." />
      )}
    </div>
  );
}

export default function GstReportsPage() {
  return (
    <Suspense fallback={null}>
      <GstReportsContent />
    </Suspense>
  );
}
