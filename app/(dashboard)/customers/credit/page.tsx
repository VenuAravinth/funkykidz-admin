"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineFire,
  HiOutlineCreditCard,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { Badge } from "@/components/atoms/Badge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, addDays } from "@/lib/format";
import { buildCustomerSummaries } from "@/lib/customers";
import { invoiceBalance } from "@/lib/dummy-data/invoices";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import { selectCustomers } from "@/stores/slices/customersSlice";

const NOT_OUTSTANDING_STATUSES = new Set(["draft", "cancelled", "refunded"]);
const INVOICE_TERM_DAYS = 15;

export default function CustomerCreditPage() {
  const invoices = useAppSelector(selectInvoices);
  const customers = useAppSelector(selectCustomers);

  const creditCustomers = useMemo(() => customers.filter((c) => c.allowCredit), [customers]);

  const rows = useMemo(() => {
    const summaries = new Map(buildCustomerSummaries(invoices).map((s) => [s.name, s]));
    return creditCustomers.map((c) => {
      const used = summaries.get(c.name)?.outstanding ?? 0;
      const available = Math.max(c.creditLimit - used, 0);
      const status = used > c.creditLimit ? "Over Limit" : used >= c.creditLimit && c.creditLimit > 0 ? "Limit Reached" : "Good";
      return { customer: c, used, available, status };
    });
  }, [creditCustomers, invoices]);

  const kpis = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    let dueThisWeek = 0;
    let overdue = 0;
    for (const inv of invoices) {
      if (NOT_OUTSTANDING_STATUSES.has(inv.status)) continue;
      const balance = invoiceBalance(inv);
      if (balance <= 0) continue;
      if (!creditCustomers.some((c) => c.name === inv.customerName)) continue;
      const dueDate = new Date(addDays(inv.createdDate, INVOICE_TERM_DAYS));
      if (dueDate < now) overdue += balance;
      else if (dueDate <= weekFromNow) dueThisWeek += balance;
    }

    return {
      totalCreditGiven: rows.reduce((sum, r) => sum + r.customer.creditLimit, 0),
      outstanding: rows.reduce((sum, r) => sum + r.used, 0),
      dueThisWeek,
      overdue,
      creditCustomerCount: creditCustomers.length,
    };
  }, [invoices, creditCustomers, rows]);

  return (
    <div>
      <PageHeader
        title="Customer Credit"
        subtitle="Credit given to customers and what's still outstanding against it."
        backHref="/customers"
        backLabel="Back to Customers"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile label="Total Credit Given" value={formatCurrency(kpis.totalCreditGiven)} icon={<HiOutlineCreditCard className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Outstanding" value={formatCurrency(kpis.outstanding)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="rose" />
        <StatTile label="Due This Week" value={formatCurrency(kpis.dueThisWeek)} icon={<HiOutlineClock className="h-5 w-5" />} tone="sky" />
        <StatTile label="Overdue" value={formatCurrency(kpis.overdue)} icon={<HiOutlineFire className="h-5 w-5" />} tone="rose" />
        <StatTile label="Credit Customers" value={String(kpis.creditCustomerCount)} icon={<HiOutlineExclamationTriangle className="h-5 w-5" />} tone="champagne" />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Customer</Th>
            <Th>Credit Limit</Th>
            <Th>Used</Th>
            <Th>Available</Th>
            <Th>Outstanding</Th>
            <Th>Status</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={6} message="No customers have credit enabled yet." />}
          {rows.map(({ customer, used, available, status }) => (
            <TableRow key={customer.id}>
              <Td>
                <Link href={`/customers/${encodeURIComponent(customer.name)}`} className="font-medium text-ink hover:text-champagne-700">
                  {customer.name}
                </Link>
              </Td>
              <Td>{formatCurrency(customer.creditLimit)}</Td>
              <Td>{formatCurrency(used)}</Td>
              <Td>{formatCurrency(available)}</Td>
              <Td className={used > 0 ? "font-medium text-red-600" : ""}>{formatCurrency(used)}</Td>
              <Td>
                <Badge tone={status === "Good" ? "success" : status === "Limit Reached" ? "warning" : "danger"}>{status}</Badge>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
