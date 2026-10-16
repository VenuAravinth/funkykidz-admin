"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineBanknotes,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { BreakdownBarChart } from "@/components/organisms/charts/BreakdownBarChart";
import { formatCurrency } from "@/lib/format";
import { buildCustomerSummaries } from "@/lib/customers";
import {
  computeCustomerReportSummary,
  computeNewCustomerTrend,
  computeRepeatCustomerBuckets,
  computeCustomerCredit,
  computeCustomerReturns,
  computeCustomerGroups,
} from "@/lib/customerReports";
import { useAppSelector } from "@/stores/hooks";
import { selectCustomers, selectCustomerGroups } from "@/stores/slices/customersSlice";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import { selectReturns } from "@/stores/slices/returnsSlice";

const TABS = [
  { label: "Top Customers", value: "top" },
  { label: "New Customers", value: "new" },
  { label: "Repeat Customers", value: "repeat" },
  { label: "Customer Credit", value: "credit" },
  { label: "Customer Returns", value: "returns" },
  { label: "Customer Groups", value: "groups" },
] as const;

type ReportType = (typeof TABS)[number]["value"];

function TopCustomersSection({ invoices }: { invoices: ReturnType<typeof selectInvoices> }) {
  const rows = buildCustomerSummaries(invoices);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Customer</Th>
          <Th>Orders</Th>
          <Th>Total Spent</Th>
          <Th>Average Order</Th>
          <Th>Outstanding</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={5} message="No customer activity yet." />}
        {rows.map((c) => (
          <TableRow key={c.name}>
            <Td>
              <Link href={`/customers/${encodeURIComponent(c.name)}`} className="font-medium text-ink hover:text-champagne-700">
                {c.name}
              </Link>
            </Td>
            <Td>{c.totalOrders}</Td>
            <Td className="font-medium">{formatCurrency(c.totalPurchases)}</Td>
            <Td>{formatCurrency(c.totalOrders > 0 ? c.totalPurchases / c.totalOrders : 0)}</Td>
            <Td className={c.outstanding > 0 ? "text-red-600" : ""}>{formatCurrency(c.outstanding)}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function NewCustomersSection({ customers }: { customers: ReturnType<typeof selectCustomers> }) {
  const rows = computeNewCustomerTrend(customers, true);
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">New Customers by Month</h2>
        <BreakdownBarChart data={rows.map((r) => ({ name: r.date, value: r.count }))} seriesName="New Customers" valuePrefix="" />
      </Card>
      <Table>
        <TableHead>
          <TableRow>
            <Th>Month</Th>
            <Th>New Customers</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={2} message="No customers recorded." />}
          {rows.map((r) => (
            <TableRow key={r.date}>
              <Td>{r.date}</Td>
              <Td className="font-medium">{r.count}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RepeatCustomersSection({ invoices }: { invoices: ReturnType<typeof selectInvoices> }) {
  const summaries = buildCustomerSummaries(invoices);
  const buckets = computeRepeatCustomerBuckets(summaries);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
      <StatTile label="1 Purchase" value={String(buckets.onePurchase)} icon={<HiOutlineUserGroup className="h-5 w-5" />} tone="sky" />
      <StatTile label="2-5 Purchases" value={String(buckets.twoToFive)} icon={<HiOutlineUserGroup className="h-5 w-5" />} tone="champagne" />
      <StatTile label="6+ Purchases" value={String(buckets.sixPlus)} icon={<HiOutlineUserGroup className="h-5 w-5" />} tone="emerald" />
    </div>
  );
}

function CustomerCreditSection({ customers, invoices }: { customers: ReturnType<typeof selectCustomers>; invoices: ReturnType<typeof selectInvoices> }) {
  const rows = computeCustomerCredit(customers, invoices);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Customer</Th>
          <Th>Credit Limit</Th>
          <Th>Outstanding</Th>
          <Th>Used %</Th>
          <Th>Payment Terms</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={5} message="No customers on credit terms." />}
        {rows.map((r) => (
          <TableRow key={r.name}>
            <Td className="font-medium text-ink">{r.name}</Td>
            <Td>{formatCurrency(r.creditLimit)}</Td>
            <Td className={r.outstanding > 0 ? "text-red-600" : ""}>{formatCurrency(r.outstanding)}</Td>
            <Td className={r.usedPercent >= 100 ? "text-red-600" : ""}>{r.usedPercent.toFixed(0)}%</Td>
            <Td>{r.paymentTerms}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CustomerReturnsSection({ returns }: { returns: ReturnType<typeof selectReturns> }) {
  const rows = computeCustomerReturns(returns);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Customer</Th>
          <Th>Return Count</Th>
          <Th>Return Amount</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={3} message="No returns recorded." />}
        {rows.map((r) => (
          <TableRow key={r.customerName}>
            <Td className="font-medium text-ink">{r.customerName}</Td>
            <Td>{r.returnCount}</Td>
            <Td className="text-red-600">{formatCurrency(r.returnAmount)}</Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CustomerGroupsSection({
  customers,
  groups,
  invoices,
}: {
  customers: ReturnType<typeof selectCustomers>;
  groups: ReturnType<typeof selectCustomerGroups>;
  invoices: ReturnType<typeof selectInvoices>;
}) {
  const rows = computeCustomerGroups(customers, groups, invoices);
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <BreakdownBarChart data={rows.map((r) => ({ name: r.groupName, value: r.totalSpent }))} seriesName="Total Spent" />
      </Card>
      <Table>
        <TableHead>
          <TableRow>
            <Th>Group</Th>
            <Th>Customers</Th>
            <Th>Total Spent</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={3} message="No customer groups found." />}
          {rows.map((r) => (
            <TableRow key={r.groupName}>
              <Td className="font-medium text-ink">{r.groupName}</Td>
              <Td>{r.customerCount}</Td>
              <Td>{formatCurrency(r.totalSpent)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CustomerReportsContent() {
  const searchParams = useSearchParams();
  const activeType = (searchParams.get("type") as ReportType | null) ?? "top";

  const customers = useAppSelector(selectCustomers);
  const groups = useAppSelector(selectCustomerGroups);
  const invoices = useAppSelector(selectInvoices);
  const returns = useAppSelector(selectReturns);

  const summary = useMemo(() => computeCustomerReportSummary(customers, invoices), [customers, invoices]);

  const tabs = TABS.map((t) => ({ label: t.label, href: `/reports/customers?type=${t.value}`, active: activeType === t.value }));

  return (
    <div>
      <PageHeader title="Customer Reports" subtitle="Who our best customers are and how much they buy." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile label="Total Customers" value={String(summary.totalCustomers)} icon={<HiOutlineUserGroup className="h-5 w-5" />} tone="champagne" />
        <StatTile label="New Customers" value={String(summary.newCustomers)} icon={<HiOutlineUserPlus className="h-5 w-5" />} tone="sky" />
        <StatTile label="Active Customers" value={String(summary.activeCustomers)} icon={<HiOutlineCheckCircle className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Credit Customers" value={String(summary.creditCustomers)} icon={<HiOutlineCreditCard className="h-5 w-5" />} tone="sky" />
        <StatTile label="Outstanding" value={formatCurrency(summary.outstanding)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="mb-6">
        <SegmentedTabs tabs={tabs} />
      </div>

      {activeType === "top" && <TopCustomersSection invoices={invoices} />}
      {activeType === "new" && <NewCustomersSection customers={customers} />}
      {activeType === "repeat" && <RepeatCustomersSection invoices={invoices} />}
      {activeType === "credit" && <CustomerCreditSection customers={customers} invoices={invoices} />}
      {activeType === "returns" && <CustomerReturnsSection returns={returns} />}
      {activeType === "groups" && <CustomerGroupsSection customers={customers} groups={groups} invoices={invoices} />}
    </div>
  );
}

export default function CustomerReportsPage() {
  return (
    <Suspense fallback={null}>
      <CustomerReportsContent />
    </Suspense>
  );
}
