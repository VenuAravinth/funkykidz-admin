"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlineCurrencyRupee,
  HiOutlineDocumentText,
  HiOutlineCube,
  HiOutlineReceiptPercent,
  HiOutlineTag,
  HiOutlineBanknotes,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlineArrowPath,
  HiOutlineArrowUturnLeft,
  HiOutlineChartBar,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { SalesSplitChart } from "@/components/organisms/charts/SalesSplitChart";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import {
  resolveDateRange,
  isInRange,
  computeSalesReport,
  computeProductSales,
  computeCategorySales,
  computePaymentReport,
  computeSalespersonReport,
  computeCustomerSalesReport,
  computeReturnReport,
  computeProfitReport,
  type DateRangePreset,
} from "@/lib/salesReports";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import { selectCustomerPayments } from "@/stores/slices/customerPaymentsSlice";
import { selectReturns } from "@/stores/slices/returnsSlice";
import { selectProducts, selectCategories } from "@/stores/slices/catalogSlice";

const RANGE_TABS: { label: string; value: DateRangePreset }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Custom Date", value: "custom" },
];

const REPORT_TABS = [
  { label: "Sales Report", value: "sales" },
  { label: "Product Sales", value: "products" },
  { label: "Category Sales", value: "category" },
  { label: "Payment Report", value: "payment" },
  { label: "Salesperson Report", value: "salesperson" },
  { label: "Customer Sales", value: "customers" },
  { label: "Return Report", value: "returns" },
  { label: "Profit Report", value: "profit" },
] as const;

type ReportType = (typeof REPORT_TABS)[number]["value"];

function SalesReportSection({ invoices }: { invoices: Parameters<typeof computeSalesReport>[0] }) {
  const data = computeSalesReport(invoices);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label="Total Sales" value={formatCurrency(data.totalSales)} icon={<HiOutlineCurrencyRupee className="h-5 w-5" />} tone="champagne" />
      <StatTile label="Number of Invoices" value={String(data.invoiceCount)} icon={<HiOutlineDocumentText className="h-5 w-5" />} tone="sky" />
      <StatTile label="Items Sold" value={String(data.itemsSold)} icon={<HiOutlineCube className="h-5 w-5" />} tone="emerald" />
      <StatTile label="Average Order Value" value={formatCurrency(data.averageOrderValue)} icon={<HiOutlineReceiptPercent className="h-5 w-5" />} tone="sky" />
      <StatTile label="Gross Sales" value={formatCurrency(data.grossSales)} icon={<HiOutlineChartBar className="h-5 w-5" />} tone="champagne" />
      <StatTile label="Discounts" value={formatCurrency(data.discounts)} icon={<HiOutlineTag className="h-5 w-5" />} tone="rose" />
      <StatTile label="Tax" value={formatCurrency(data.tax)} icon={<HiOutlineReceiptPercent className="h-5 w-5" />} tone="sky" />
      <StatTile label="Net Sales" value={formatCurrency(data.netSales)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="emerald" />
    </div>
  );
}

function ProductSalesSection({ invoices, products }: { invoices: Parameters<typeof computeProductSales>[0]; products: Parameters<typeof computeProductSales>[1] }) {
  const rows = computeProductSales(invoices, products);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Product</Th>
          <Th>Units Sold</Th>
          <Th>Revenue</Th>
          <Th>Cost</Th>
          <Th>Profit</Th>
          <Th>Margin %</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={6} message="No sales in this period." />}
        {rows.map((r) => (
          <TableRow key={r.product}>
            <Td className="font-medium text-ink">{r.product}</Td>
            <Td>{r.unitsSold}</Td>
            <Td>{formatCurrency(r.revenue)}</Td>
            <Td>{r.cost !== null ? formatCurrency(r.cost) : "—"}</Td>
            <Td className={r.profit !== null && r.profit >= 0 ? "text-emerald-600" : r.profit !== null ? "text-red-600" : ""}>
              {r.profit !== null ? formatCurrency(r.profit) : "—"}
            </Td>
            <Td>{r.marginPercent !== null ? `${r.marginPercent.toFixed(1)}%` : "—"}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CategorySalesSection({ invoices, products, categories }: { invoices: Parameters<typeof computeCategorySales>[0]; products: Parameters<typeof computeCategorySales>[1]; categories: Parameters<typeof computeCategorySales>[2] }) {
  const rows = computeCategorySales(invoices, products, categories);
  return (
    <div className="flex flex-col gap-6">
      {rows.length > 0 && (
        <Card className="p-6">
          <SalesSplitChart data={rows.map((r) => ({ name: r.category, amount: r.amount }))} />
        </Card>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <Th>Category</Th>
            <Th>Sales</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={2} message="No sales in this period." />}
          {rows.map((r) => (
            <TableRow key={r.category}>
              <Td className="font-medium text-ink">{r.category}</Td>
              <Td>{formatCurrencyCompact(r.amount)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentReportSection({ payments }: { payments: Parameters<typeof computePaymentReport>[0] }) {
  const rows = computePaymentReport(payments);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {rows.map((r) => (
        <StatTile key={r.method} label={r.method} value={formatCurrency(r.amount)} hint={`${r.count} payment${r.count === 1 ? "" : "s"}`} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="sky" />
      ))}
    </div>
  );
}

function SalespersonReportSection({ invoices, returns, products }: { invoices: Parameters<typeof computeSalespersonReport>[0]; returns: Parameters<typeof computeSalespersonReport>[1]; products: Parameters<typeof computeSalespersonReport>[2] }) {
  const rows = computeSalespersonReport(invoices, returns, products);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Employee</Th>
          <Th>Orders</Th>
          <Th>Sales</Th>
          <Th>Discounts</Th>
          <Th>Returns</Th>
          <Th>Profit</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={6} message="No salesperson-attributed sales in this period." />}
        {rows.map((r) => (
          <TableRow key={r.salesperson}>
            <Td className="font-medium text-ink">{r.salesperson}</Td>
            <Td>{r.orders}</Td>
            <Td>{formatCurrency(r.sales)}</Td>
            <Td>{formatCurrency(r.discounts)}</Td>
            <Td className={r.returns > 0 ? "text-red-600" : ""}>{formatCurrency(r.returns)}</Td>
            <Td className={r.profit >= 0 ? "text-emerald-600" : "text-red-600"}>{formatCurrency(r.profit)}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CustomerSalesSection({ allInvoices, rangeInvoices }: { allInvoices: Parameters<typeof computeCustomerSalesReport>[0]; rangeInvoices: Parameters<typeof computeCustomerSalesReport>[1] }) {
  const data = computeCustomerSalesReport(allInvoices, rangeInvoices);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile label="New Customers" value={String(data.newCustomersCount)} icon={<HiOutlineUserPlus className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Repeat Customers" value={String(data.repeatCustomersCount)} icon={<HiOutlineArrowPath className="h-5 w-5" />} tone="sky" />
        <StatTile label="Average Customer Spend" value={formatCurrency(data.averageCustomerSpend)} icon={<HiOutlineUserGroup className="h-5 w-5" />} tone="emerald" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Top Customers</h3>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Customer</Th>
              <Th>Orders</Th>
              <Th>Purchases</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.topCustomers.length === 0 && <TableEmpty colSpan={3} message="No customer activity in this period." />}
            {data.topCustomers.map((c) => (
              <TableRow key={c.name}>
                <Td>
                  <Link href={`/customers/${encodeURIComponent(c.name)}`} className="font-medium text-ink hover:text-champagne-700">
                    {c.name}
                  </Link>
                </Td>
                <Td>{c.totalOrders}</Td>
                <Td>{formatCurrency(c.totalPurchases)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ReturnReportSection({ returns, totalSales }: { returns: Parameters<typeof computeReturnReport>[0]; totalSales: number }) {
  const data = computeReturnReport(returns, totalSales);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile label="Total Returns" value={String(data.totalReturns)} icon={<HiOutlineArrowUturnLeft className="h-5 w-5" />} tone="rose" />
        <StatTile label="Return Amount" value={formatCurrency(data.returnAmount)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="rose" />
        <StatTile label="Return Rate" value={`${data.returnRatePercent.toFixed(1)}%`} icon={<HiOutlineReceiptPercent className="h-5 w-5" />} tone="sky" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Top Returned Products</h3>
          <Table>
            <TableHead>
              <TableRow>
                <Th>Product</Th>
                <Th>Qty</Th>
                <Th>Amount</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.topReturnedProducts.length === 0 && <TableEmpty colSpan={3} message="No returns in this period." />}
              {data.topReturnedProducts.map((r) => (
                <TableRow key={r.product}>
                  <Td>{r.product}</Td>
                  <Td>{r.quantity}</Td>
                  <Td>{formatCurrency(r.amount)}</Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Return Reasons</h3>
          <Table>
            <TableHead>
              <TableRow>
                <Th>Reason</Th>
                <Th>Count</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.reasonBreakdown.length === 0 && <TableEmpty colSpan={2} message="No returns in this period." />}
              {data.reasonBreakdown.map((r) => (
                <TableRow key={r.reason}>
                  <Td>{r.reason}</Td>
                  <Td>{r.count}</Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function ProfitReportSection({ invoices, products }: { invoices: Parameters<typeof computeProfitReport>[0]; products: Parameters<typeof computeProfitReport>[1] }) {
  const data = computeProfitReport(invoices, products);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label="Sales Revenue" value={formatCurrency(data.salesRevenue)} icon={<HiOutlineCurrencyRupee className="h-5 w-5" />} tone="champagne" />
      <StatTile label="Cost of Goods" value={formatCurrency(data.costOfGoods)} icon={<HiOutlineTag className="h-5 w-5" />} tone="rose" />
      <StatTile label="Gross Profit" value={formatCurrency(data.grossProfit)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="emerald" />
      <StatTile label="Gross Margin" value={`${data.grossMarginPercent.toFixed(1)}%`} icon={<HiOutlineReceiptPercent className="h-5 w-5" />} tone="sky" />
    </div>
  );
}

function SalesReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rangePreset = (searchParams.get("range") as DateRangePreset | null) ?? "today";
  const reportType = (searchParams.get("type") as ReportType | null) ?? "sales";
  const customFrom = searchParams.get("from") ?? "";
  const customTo = searchParams.get("to") ?? "";

  const range = resolveDateRange(rangePreset, customFrom, customTo);

  const allInvoices = useAppSelector(selectInvoices);
  const allPayments = useAppSelector(selectCustomerPayments);
  const allReturns = useAppSelector(selectReturns);
  const products = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategories);

  const invoices = useMemo(() => allInvoices.filter((i) => isInRange(i.createdDate, range)), [allInvoices, range]);
  const payments = useMemo(() => allPayments.filter((p) => isInRange(p.date, range)), [allPayments, range]);
  const returns = useMemo(() => allReturns.filter((r) => isInRange(r.createdDate, range)), [allReturns, range]);

  const totalSales = useMemo(() => computeSalesReport(invoices).totalSales, [invoices]);

  const rangeTabs = RANGE_TABS.map((tab) => ({
    label: tab.label,
    href: `/sales/reports?range=${tab.value}&type=${reportType}${tab.value === "custom" ? `&from=${customFrom || range.from}&to=${customTo || range.to}` : ""}`,
    active: rangePreset === tab.value,
  }));

  const reportTabs = REPORT_TABS.map((tab) => ({
    label: tab.label,
    href: `/sales/reports?range=${rangePreset}&type=${tab.value}${rangePreset === "custom" ? `&from=${customFrom}&to=${customTo}` : ""}`,
    active: reportType === tab.value,
  }));

  const setCustomDate = (which: "from" | "to", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    params.set(which, value);
    if (!params.get(which === "from" ? "to" : "from")) params.set(which === "from" ? "to" : "from", value);
    router.push(`/sales/reports?${params.toString()}`);
  };

  return (
    <div>
      <PageHeader title="Sales Reports" subtitle="Your sales analytics center." />

      <div className="mb-4">
        <SegmentedTabs tabs={rangeTabs} />
      </div>

      {rangePreset === "custom" && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Input type="date" value={customFrom} onChange={(e) => setCustomDate("from", e.target.value)} className="w-auto" />
          <span className="text-sm text-ink-muted">to</span>
          <Input type="date" value={customTo} onChange={(e) => setCustomDate("to", e.target.value)} className="w-auto" />
        </div>
      )}

      <div className="mb-6">
        <SegmentedTabs tabs={reportTabs} />
      </div>

      {reportType === "sales" && <SalesReportSection invoices={invoices} />}
      {reportType === "products" && <ProductSalesSection invoices={invoices} products={products} />}
      {reportType === "category" && <CategorySalesSection invoices={invoices} products={products} categories={categories} />}
      {reportType === "payment" && <PaymentReportSection payments={payments} />}
      {reportType === "salesperson" && <SalespersonReportSection invoices={invoices} returns={returns} products={products} />}
      {reportType === "customers" && <CustomerSalesSection allInvoices={allInvoices} rangeInvoices={invoices} />}
      {reportType === "returns" && <ReturnReportSection returns={returns} totalSales={totalSales} />}
      {reportType === "profit" && <ProfitReportSection invoices={invoices} products={products} />}
    </div>
  );
}

export default function SalesReportsPage() {
  return (
    <Suspense fallback={null}>
      <SalesReportsContent />
    </Suspense>
  );
}
