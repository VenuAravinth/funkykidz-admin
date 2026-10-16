import type { Metadata } from "next";
import Link from "next/link";
import { HiOutlinePlus } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Select } from "@/components/atoms/Select";
import { StatusSwitch } from "@/components/molecules/StatusSwitch";
import { Button } from "@/components/atoms/Button";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { suppliers } from "@/lib/dummy-data/suppliers";

export const metadata: Metadata = {
  title: "Suppliers — Supplier Management",
};

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const { q = "", status = "", category = "" } = await searchParams;

  const filtered = suppliers.filter((s) => {
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.code.toLowerCase().includes(q.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(q.toLowerCase());
    const matchesStatus = !status || s.status === status;
    const matchesCategory = !category || s.category === category;
    return matchesQuery && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(suppliers.map((s) => s.category)));

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle={`${suppliers.length} suppliers on record`}
        actions={
          <>
            <form method="get" className="contents">
              <Select name="category" defaultValue={category} aria-label="Filter by category">
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Select name="status" defaultValue={status} aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
              <SearchInput name="q" defaultValue={q} placeholder="Search name, code, contact…" aria-label="Search suppliers" />
              <Button type="submit" variant="secondary">
                Filter
              </Button>
            </form>
            <Link href="/suppliers/new">
              <Button>
                <HiOutlinePlus className="h-5 w-5" />
                Add Supplier
              </Button>
            </Link>
          </>
        }
      />

      <Table>
        <TableHead>
          <TableRow>
            <Th>Supplier</Th>
            <Th>Category</Th>
            <Th>Contact</Th>
            <Th>Status</Th>
            <Th>Rating</Th>
            <Th>Total Purchases</Th>
            <Th>Outstanding</Th>
            <Th>Last Activity</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={8} message="No suppliers match your filters." />}
          {filtered.map((s) => (
            <TableRow key={s.id}>
              <Td>
                <Link href={`/suppliers/${s.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {s.name}
                </Link>
                <div className="text-xs text-ink-muted">{s.code}</div>
              </Td>
              <Td>{s.category}</Td>
              <Td>
                <div>{s.contactPerson}</div>
                <div className="text-xs text-ink-muted">{s.email}</div>
              </Td>
              <Td>
                <StatusSwitch active={s.status === "active"} name={s.name} />
              </Td>
              <Td>{s.rating.toFixed(1)} / 5</Td>
              <Td>{formatCurrency(s.totalPurchases)}</Td>
              <Td>{formatCurrency(s.outstandingAmount)}</Td>
              <Td>{formatDate(s.lastActivityDate)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
