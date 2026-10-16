"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { buildOnlineCustomerSummaries } from "@/lib/onlineStoreHelpers";
import { useAppSelector } from "@/stores/hooks";
import { selectOnlineOrders } from "@/stores/slices/onlineOrdersSlice";

export default function OnlineCustomersPage() {
  const orders = useAppSelector(selectOnlineOrders);
  const [query, setQuery] = useState("");

  const summaries = useMemo(() => buildOnlineCustomerSummaries(orders), [orders]);
  const filtered = summaries.filter(
    (c) => !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query),
  );

  return (
    <div>
      <PageHeader
        title="Online Customers"
        subtitle="Customers who've ordered from your website — the same customer master as your ERP."
        backHref="/online-store"
        backLabel="Online Store"
      />

      <div className="mb-5">
        <SearchInput placeholder="Search customers…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search customers" />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Customer</Th>
            <Th>Phone</Th>
            <Th>Online Orders</Th>
            <Th>Total Spent</Th>
            <Th>Last Order</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={5} message="No online customers found." />}
          {filtered.map((customer) => (
            <TableRow key={customer.name}>
              <Td>
                <Link href={`/customers/${encodeURIComponent(customer.name)}`} className="font-medium text-ink hover:text-champagne-700">
                  {customer.name}
                </Link>
              </Td>
              <Td>{customer.phone}</Td>
              <Td>{customer.totalOrders}</Td>
              <Td>{formatCurrency(customer.totalSpent)}</Td>
              <Td>{formatDate(customer.lastOrderDate)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
