"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { HiOutlineDocumentText, HiOutlineReceiptPercent, HiOutlineBanknotes, HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { ComingSoon } from "@/components/molecules/ComingSoon";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency } from "@/lib/format";
import { purchaseOrders } from "@/lib/dummy-data/suppliers";
import {
  computeGstSummary,
  computeSalesByRate,
  computePurchasesByRate,
  computeTaxByProduct,
  computeTaxByCategory,
  computeGstByInvoice,
  type TaxByGroupRow,
} from "@/lib/taxReports";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import { selectProducts, selectCategories } from "@/stores/slices/catalogSlice";

const TABS = [
  { label: "Tax Summary", value: "summary" },
  { label: "Tax-Rate Report", value: "rate" },
  { label: "Tax by Product", value: "product" },
  { label: "Tax by Category", value: "category" },
  { label: "Tax by Invoice", value: "invoice" },
  { label: "Tax Adjustments", value: "adjustments" },
] as const;

type ReportType = (typeof TABS)[number]["value"];

function GroupTable({ rows, nameLabel }: { rows: TaxByGroupRow[]; nameLabel: string }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>{nameLabel}</Th>
          <Th>Taxable Amount</Th>
          <Th>Tax Amount</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={3} message="No records in this period." />}
        {rows.map((r) => (
          <TableRow key={r.name}>
            <Td className="font-medium text-ink">{r.name}</Td>
            <Td>{formatCurrency(r.taxableAmount)}</Td>
            <Td>{formatCurrency(r.taxAmount)}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function TaxReportsContent() {
  const searchParams = useSearchParams();
  const activeType = (searchParams.get("type") as ReportType | null) ?? "summary";

  const invoices = useAppSelector(selectInvoices);
  const products = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategories);

  const summary = useMemo(() => computeGstSummary(invoices), [invoices]);
  const purchasesByRate = useMemo(() => computePurchasesByRate(purchaseOrders), []);
  const taxPaid = useMemo(() => purchasesByRate.reduce((sum, r) => sum + r.taxAmount, 0), [purchasesByRate]);
  const salesByRate = useMemo(() => computeSalesByRate(invoices), [invoices]);
  const byProduct = useMemo(() => computeTaxByProduct(invoices), [invoices]);
  const byCategory = useMemo(() => computeTaxByCategory(invoices, products, categories), [invoices, products, categories]);
  const byInvoice = useMemo(() => computeGstByInvoice(invoices), [invoices]);

  const tabs = TABS.map((t) => ({ label: t.label, href: `/reports/tax?type=${t.value}`, active: activeType === t.value }));

  const combinedRates = useMemo(() => {
    const map = new Map<number, { rate: number; taxableSales: number; taxCollected: number }>();
    for (const r of salesByRate) map.set(r.rate, { rate: r.rate, taxableSales: r.taxableAmount, taxCollected: r.taxAmount });
    return [...map.values()].sort((a, b) => a.rate - b.rate);
  }, [salesByRate]);

  return (
    <div>
      <PageHeader title="Tax Reports" subtitle="Tax collected, tax paid, and a rate-wise breakdown across the business." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Taxable Amount" value={formatCurrency(summary.taxableSales)} icon={<HiOutlineReceiptPercent className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Tax Collected" value={formatCurrency(summary.totalGstCollected)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Tax Paid" value={formatCurrency(taxPaid)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="rose" />
        <StatTile label="Tax Adjustments" value={formatCurrency(0)} icon={<HiOutlineAdjustmentsHorizontal className="h-5 w-5" />} tone="sky" />
      </div>

      <div className="mb-6">
        <SegmentedTabs tabs={tabs} />
      </div>

      {activeType === "summary" && (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Tax Rate</Th>
              <Th>Taxable Sales</Th>
              <Th>Tax Amount</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {combinedRates.length === 0 && <TableEmpty colSpan={3} message="No taxable sales recorded." />}
            {combinedRates.map((r) => (
              <TableRow key={r.rate}>
                <Td className="font-medium text-ink">{r.rate}%</Td>
                <Td>{formatCurrency(r.taxableSales)}</Td>
                <Td>{formatCurrency(r.taxCollected)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {activeType === "rate" && (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Tax Rate</Th>
              <Th>Taxable Sales</Th>
              <Th>Tax Amount</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {combinedRates.length === 0 && <TableEmpty colSpan={3} message="No taxable sales recorded." />}
            {combinedRates.map((r) => (
              <TableRow key={r.rate}>
                <Td className="font-medium text-ink">{r.rate}%</Td>
                <Td>{formatCurrency(r.taxableSales)}</Td>
                <Td>{formatCurrency(r.taxCollected)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {activeType === "product" && <GroupTable rows={byProduct} nameLabel="Product" />}
      {activeType === "category" && <GroupTable rows={byCategory} nameLabel="Category" />}
      {activeType === "invoice" && (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Invoice</Th>
              <Th>Customer</Th>
              <Th>Taxable Amount</Th>
              <Th>Rate</Th>
              <Th>Tax Amount</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {byInvoice.length === 0 && <TableEmpty colSpan={5} message="No invoices recorded." />}
            {byInvoice.map((r) => (
              <TableRow key={r.invoiceNumber}>
                <Td className="font-medium text-ink">{r.invoiceNumber}</Td>
                <Td>{r.customerName}</Td>
                <Td>{formatCurrency(r.taxableAmount)}</Td>
                <Td>{r.gstPercent}%</Td>
                <Td>{formatCurrency(r.gstAmount)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {activeType === "adjustments" && (
        <ComingSoon icon={HiOutlineDocumentText} message="Manual tax adjustments aren't tracked as their own record yet." />
      )}
    </div>
  );
}

export default function TaxReportsPage() {
  return (
    <Suspense fallback={null}>
      <TaxReportsContent />
    </Suspense>
  );
}
