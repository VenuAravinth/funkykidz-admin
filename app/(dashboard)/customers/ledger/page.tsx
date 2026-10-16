"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { buildCustomerSummaries } from "@/lib/customers";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoices } from "@/stores/slices/invoicesSlice";

export default function CustomerLedgerHubPage() {
  const invoices = useAppSelector(selectInvoices);
  const [query, setQuery] = useState("");

  const customers = useMemo(() => {
    const all = buildCustomerSummaries(invoices);
    const q = query.trim().toLowerCase();
    return q ? all.filter((c) => c.name.toLowerCase().includes(q)) : all;
  }, [invoices, query]);

  return (
    <div>
      <PageHeader
        title="Customer Ledger"
        subtitle="Pick a customer to see their full purchase and payment history with a running balance."
        backHref="/customers"
        backLabel="Back to Customers"
      />

      <div className="mb-5">
        <SearchInput placeholder="Search by customer…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search customers" />
      </div>

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Customer</Th>
            <Th>Phone</Th>
            <Th>Total Purchases</Th>
            <Th>Outstanding</Th>
            <Th>Last Purchase</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.length === 0 && <TableEmpty colSpan={6} message="No customers found." />}
          {customers.map((c) => (
            <TableRow key={c.name}>
              <Td className="font-medium text-ink">{c.name}</Td>
              <Td>{c.phone}</Td>
              <Td>{formatCurrency(c.totalPurchases)}</Td>
              <Td className={c.outstanding > 0 ? "font-medium text-red-600" : ""}>{formatCurrency(c.outstanding)}</Td>
              <Td>{c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : "—"}</Td>
              <Td className="text-right">
                <Link
                  href={`/customers/${encodeURIComponent(c.name)}#ledger`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-champagne-600 hover:text-champagne-700"
                >
                  <HiOutlineDocumentText className="h-4 w-4" />
                  View Ledger
                </Link>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
