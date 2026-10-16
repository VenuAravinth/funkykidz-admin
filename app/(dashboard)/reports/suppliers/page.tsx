import type { Metadata } from "next";
import Link from "next/link";
import {
  HiOutlineBuildingStorefront,
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { StatusSwitch } from "@/components/molecules/StatusSwitch";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { PurchaseByCategoryChart } from "@/components/organisms/charts/PurchaseByCategoryChart";
import { SupplierPerformanceChart } from "@/components/organisms/charts/SupplierPerformanceChart";
import { SupplierSelectRedirect } from "@/components/organisms/SupplierSelectRedirect";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  getPurchaseReport,
  getSupplierLedger,
  getOutstandingReport,
  getSupplierPerformance,
  getSupplierReportSummary,
  getSupplierProductPricing,
  suppliers,
} from "@/lib/dummy-data/suppliers";

export const metadata: Metadata = {
  title: "Supplier Reports — Funky Kids ERP",
};

type ReportType = "purchase" | "ledger" | "outstanding" | "performance" | "pricing";

export default async function SupplierReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; supplierId?: string }>;
}) {
  const { type = "purchase", supplierId } = await searchParams;
  const activeType = type as ReportType;
  const summary = getSupplierReportSummary();

  const tabs = [
    { label: "Supplier Purchase", href: "/reports/suppliers?type=purchase", active: activeType === "purchase" },
    { label: "Supplier Ledger", href: "/reports/suppliers?type=ledger", active: activeType === "ledger" },
    { label: "Supplier Outstanding", href: "/reports/suppliers?type=outstanding", active: activeType === "outstanding" },
    { label: "Supplier Performance", href: "/reports/suppliers?type=performance", active: activeType === "performance" },
    { label: "Supplier Product Pricing", href: "/reports/suppliers?type=pricing", active: activeType === "pricing" },
  ];

  return (
    <div>
      <PageHeader title="Supplier Reports" subtitle="Which suppliers are good, how much we buy from them, and whom we owe." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Suppliers" value={String(summary.totalSuppliers)} icon={<HiOutlineBuildingStorefront className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Active Suppliers" value={String(summary.activeSuppliers)} icon={<HiOutlineCheckCircle className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Outstanding" value={formatCurrency(summary.outstanding)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="sky" />
        <StatTile label="Overdue" value={formatCurrency(summary.overdue)} icon={<HiOutlineExclamationTriangle className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="mb-6">
        <SegmentedTabs tabs={tabs} />
      </div>

      {activeType === "purchase" && <PurchaseReport />}
      {activeType === "ledger" && <SupplierLedgerReport supplierId={supplierId} />}
      {activeType === "outstanding" && <OutstandingReport />}
      {activeType === "performance" && <SupplierPerformance />}
      {activeType === "pricing" && <SupplierPricingReport />}
    </div>
  );
}

function PurchaseReport() {
  const rows = getPurchaseReport();
  const grandTotal = rows.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Purchase Amount by Category</h2>
        <PurchaseByCategoryChart data={rows} />
      </Card>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Category</Th>
            <Th>Orders</Th>
            <Th>Total Purchase Value</Th>
            <Th>% of Total</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.category}>
              <Td>{r.category}</Td>
              <Td>{r.orderCount}</Td>
              <Td>{formatCurrency(r.totalAmount)}</Td>
              <Td>{grandTotal ? Math.round((r.totalAmount / grandTotal) * 100) : 0}%</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SupplierLedgerReport({ supplierId }: { supplierId?: string }) {
  const activeSupplier = suppliers.find((s) => s.id === supplierId) ?? suppliers[0];
  const entries = getSupplierLedger(activeSupplier.id).reduce<Array<ReturnType<typeof getSupplierLedger>[number] & { balance: number }>>(
    (acc, entry) => {
      const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      acc.push({ ...entry, balance: previousBalance + entry.debit - entry.credit });
      return acc;
    },
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="max-w-sm">
        <SupplierSelectRedirect suppliers={suppliers} selectedId={activeSupplier.id} basePath="/reports/suppliers" />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Description</Th>
            <Th>Debit</Th>
            <Th>Credit</Th>
            <Th>Balance</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.length === 0 && <TableEmpty colSpan={6} message="No ledger activity for this supplier." />}
          {entries.map((e, i) => (
            <TableRow key={i}>
              <Td>{formatDate(e.date)}</Td>
              <Td>{e.type}</Td>
              <Td>{e.description}</Td>
              <Td>{e.debit ? formatCurrency(e.debit) : "—"}</Td>
              <Td>{e.credit ? formatCurrency(e.credit) : "—"}</Td>
              <Td className="font-medium">{formatCurrency(e.balance)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function OutstandingReport() {
  const rows = getOutstandingReport();
  const total = rows.reduce((sum, s) => sum + s.outstandingAmount, 0);

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex items-center justify-between p-5">
        <span className="text-sm text-ink-muted">Total Outstanding Across Suppliers</span>
        <span className="text-xl font-semibold text-champagne-700">{formatCurrency(total)}</span>
      </Card>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Supplier</Th>
            <Th>Category</Th>
            <Th>Status</Th>
            <Th>Payment Terms</Th>
            <Th>Outstanding Amount</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={5} message="No outstanding balances." />}
          {rows.map((s) => (
            <TableRow key={s.id}>
              <Td>
                <Link href={`/suppliers/${s.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {s.name}
                </Link>
              </Td>
              <Td>{s.category}</Td>
              <Td>
                <StatusSwitch active={s.status === "active"} name={s.name} />
              </Td>
              <Td>{s.paymentTerms}</Td>
              <Td className="font-medium">{formatCurrency(s.outstandingAmount)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SupplierPerformance() {
  const rows = getSupplierPerformance();

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">On-Time Delivery vs. Defect Rate</h2>
        <SupplierPerformanceChart rows={rows} />
      </Card>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Supplier</Th>
            <Th>Rating</Th>
            <Th>Total Orders</Th>
            <Th>On-Time Rate</Th>
            <Th>Defect Rate</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.supplier.id}>
              <Td>
                <Link href={`/suppliers/${r.supplier.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {r.supplier.name}
                </Link>
              </Td>
              <Td>{r.supplier.rating.toFixed(1)} / 5</Td>
              <Td>{r.totalOrders}</Td>
              <Td>{r.onTimeRate}%</Td>
              <Td>{r.defectRate}%</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SupplierPricingReport() {
  const rows = getSupplierProductPricing();

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-muted">Products purchased from more than one supplier, compared by their most recent quoted price.</p>
      {rows.length === 0 ? (
        <Table>
          <TableBody>
            <TableEmpty colSpan={1} message="No product is currently sourced from more than one supplier." />
          </TableBody>
        </Table>
      ) : (
        rows.map((row) => (
          <Card key={row.barcode} className="p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-ink">{row.description}</h3>
              <span className="text-xs text-ink-muted">{row.barcode}</span>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <Th>Supplier</Th>
                  <Th>Price</Th>
                  <Th>As Of</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {row.prices.map((p, i) => (
                  <TableRow key={p.supplierName}>
                    <Td className={i === 0 ? "font-medium text-emerald-600" : "text-ink"}>{p.supplierName}</Td>
                    <Td>{formatCurrency(p.price)}</Td>
                    <Td>{formatDate(p.date)}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ))
      )}
    </div>
  );
}
