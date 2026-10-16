import type { Metadata } from "next";
import Link from "next/link";
import {
  HiOutlineCurrencyRupee,
  HiOutlineClipboardDocumentList,
  HiOutlineCube,
  HiOutlineArrowUturnLeft,
  HiOutlineBanknotes,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { BreakdownBarChart } from "@/components/organisms/charts/BreakdownBarChart";
import { formatCurrency, formatDate } from "@/lib/format";
import { purchaseOrders, goodsReceipts, suppliers } from "@/lib/dummy-data/suppliers";
import {
  computePurchaseSummary,
  computeDailyPurchases,
  computeMonthlyPurchases,
  computeSupplierPurchases,
  computeProductPurchases,
  computePurchaseOrderReport,
  computePurchaseReturns,
} from "@/lib/purchaseReports";

export const metadata: Metadata = {
  title: "Purchase Reports — Funky Kids ERP",
};

type ReportType = "summary" | "supplier" | "product" | "orders" | "returns";

export default async function PurchaseReportsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type = "summary" } = await searchParams;
  const activeType = type as ReportType;
  const summary = computePurchaseSummary(purchaseOrders, goodsReceipts, suppliers);

  const tabs = [
    { label: "Purchase Summary", href: "/reports/purchase?type=summary", active: activeType === "summary" },
    { label: "Supplier-wise", href: "/reports/purchase?type=supplier", active: activeType === "supplier" },
    { label: "Product Purchase", href: "/reports/purchase?type=product", active: activeType === "product" },
    { label: "Purchase Order Report", href: "/reports/purchase?type=orders", active: activeType === "orders" },
    { label: "Purchase Return Report", href: "/reports/purchase?type=returns", active: activeType === "returns" },
  ];

  return (
    <div>
      <PageHeader title="Purchase Reports" subtitle="How much stock did we buy and from whom." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile label="Total Purchases" value={formatCurrency(summary.totalPurchases)} icon={<HiOutlineCurrencyRupee className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Purchase Orders" value={String(summary.purchaseOrders)} icon={<HiOutlineClipboardDocumentList className="h-5 w-5" />} tone="sky" />
        <StatTile label="Items Purchased" value={summary.itemsPurchased.toLocaleString("en-IN")} icon={<HiOutlineCube className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Purchase Returns" value={formatCurrency(summary.purchaseReturns)} icon={<HiOutlineArrowUturnLeft className="h-5 w-5" />} tone="rose" />
        <StatTile label="Outstanding" value={formatCurrency(summary.outstanding)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="sky" />
      </div>

      <div className="mb-6">
        <SegmentedTabs tabs={tabs} />
      </div>

      {activeType === "summary" && <PurchaseSummarySection />}
      {activeType === "supplier" && <SupplierWiseSection />}
      {activeType === "product" && <ProductPurchaseSection />}
      {activeType === "orders" && <PurchaseOrderSection />}
      {activeType === "returns" && <PurchaseReturnSection />}
    </div>
  );
}

function PurchaseSummarySection() {
  const monthly = computeMonthlyPurchases(purchaseOrders);
  const daily = computeDailyPurchases(purchaseOrders);

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Monthly Purchases</h2>
        <BreakdownBarChart data={monthly.map((m) => ({ name: m.month, value: m.amount }))} seriesName="Purchases" />
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Daily Purchases</h3>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Date</Th>
              <Th>Orders</Th>
              <Th>Amount</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {daily.length === 0 && <TableEmpty colSpan={3} message="No purchases recorded." />}
            {daily.map((d) => (
              <TableRow key={d.date}>
                <Td>{formatDate(d.date)}</Td>
                <Td>{d.orders}</Td>
                <Td className="font-medium">{formatCurrency(d.amount)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SupplierWiseSection() {
  const rows = computeSupplierPurchases(purchaseOrders);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Supplier</Th>
          <Th>Orders</Th>
          <Th>Units</Th>
          <Th>Purchase Value</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={4} message="No purchases recorded." />}
        {rows.map((r) => (
          <TableRow key={r.supplierId}>
            <Td>
              <Link href={`/suppliers/${r.supplierId}`} className="font-medium text-ink hover:text-champagne-700">
                {r.supplierName}
              </Link>
            </Td>
            <Td>{r.orders}</Td>
            <Td>{r.units.toLocaleString("en-IN")}</Td>
            <Td className="font-medium">{formatCurrency(r.value)}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ProductPurchaseSection() {
  const rows = computeProductPurchases(purchaseOrders);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Product</Th>
          <Th>Quantity Purchased</Th>
          <Th>Purchase Cost</Th>
          <Th>Average Price</Th>
          <Th>Last Price</Th>
          <Th>Last Purchase</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={6} message="No purchases recorded." />}
        {rows.map((r) => (
          <TableRow key={r.barcode}>
            <Td>
              <div className="font-medium text-ink">{r.description}</div>
              <div className="text-xs text-ink-muted">{r.barcode}</div>
            </Td>
            <Td>{r.quantityPurchased.toLocaleString("en-IN")}</Td>
            <Td>{formatCurrency(r.purchaseCost)}</Td>
            <Td>{formatCurrency(r.averagePrice)}</Td>
            <Td>{formatCurrency(r.lastPrice)}</Td>
            <Td>{formatDate(r.lastPurchaseDate)}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PurchaseOrderSection() {
  const rows = computePurchaseOrderReport(purchaseOrders);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>PO Number</Th>
          <Th>Supplier</Th>
          <Th>PO Amount</Th>
          <Th>Received Amount</Th>
          <Th>Pending Qty</Th>
          <Th>Expected Date</Th>
          <Th>Status</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={7} message="No purchase orders recorded." />}
        {rows.map((r) => (
          <TableRow key={r.poNumber}>
            <Td className="font-medium text-ink">{r.poNumber}</Td>
            <Td>{r.supplierName}</Td>
            <Td>{formatCurrency(r.amount)}</Td>
            <Td>{formatCurrency(r.receivedAmount)}</Td>
            <Td>{r.pendingQuantity.toLocaleString("en-IN")}</Td>
            <Td>{formatDate(r.expectedDate)}</Td>
            <Td>
              <StatusBadge status={r.status} />
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PurchaseReturnSection() {
  const rows = computePurchaseReturns(goodsReceipts, purchaseOrders);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">
        Built from damaged and missing quantities logged on goods receipts — the closest real record to a purchase return in this system.
      </p>
      <Table>
        <TableHead>
          <TableRow>
            <Th>GRN</Th>
            <Th>Supplier</Th>
            <Th>PO Number</Th>
            <Th>Reason</Th>
            <Th>Return Quantity</Th>
            <Th>Return Value</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={6} message="No damaged or missing stock recorded." />}
          {rows.map((r, i) => (
            <TableRow key={i}>
              <Td className="font-medium text-ink">{r.grnNumber}</Td>
              <Td>{r.supplierName}</Td>
              <Td>{r.poNumber}</Td>
              <Td>{r.reason}</Td>
              <Td>{r.quantity}</Td>
              <Td className="text-red-600">{formatCurrency(r.value)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
