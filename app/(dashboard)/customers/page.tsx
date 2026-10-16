"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineBanknotes,
  HiOutlinePencil,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { StatTile } from "@/components/molecules/StatTile";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { StatusSwitch } from "@/components/molecules/StatusSwitch";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency } from "@/lib/format";
import { buildCustomerSummaries } from "@/lib/customers";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import { selectCustomers, selectCustomerGroups, setCustomerStatus } from "@/stores/slices/customersSlice";

export default function CustomersPage() {
  const router = useRouter();
  const invoices = useAppSelector(selectInvoices);
  const dispatch = useAppDispatch();
  const masterCustomers = useAppSelector(selectCustomers);
  const groups = useAppSelector(selectCustomerGroups);

  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [creditOnly, setCreditOnly] = useState(false);

  const groupById = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);

  const rows = useMemo(() => {
    const summaries = new Map(buildCustomerSummaries(invoices).map((s) => [s.name, s]));

    const fromMaster = masterCustomers.map((c) => {
      const summary = summaries.get(c.name);
      summaries.delete(c.name);
      return {
        key: c.id,
        name: c.name,
        phone: c.phone || summary?.phone || "—",
        group: groupById.get(c.groupId)?.name ?? "—",
        totalOrders: summary?.totalOrders ?? 0,
        totalPurchases: summary?.totalPurchases ?? 0,
        outstanding: summary?.outstanding ?? 0,
        creditLimit: c.allowCredit ? c.creditLimit : 0,
        status: c.status,
        hasMaster: true,
      };
    });

    const legacy = [...summaries.values()].map((s) => ({
      key: s.name,
      name: s.name,
      phone: s.phone,
      group: "—",
      totalOrders: s.totalOrders,
      totalPurchases: s.totalPurchases,
      outstanding: s.outstanding,
      creditLimit: 0,
      status: "active" as const,
      hasMaster: false,
    }));

    return [...fromMaster, ...legacy];
  }, [invoices, masterCustomers, groupById]);

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || r.name.toLowerCase().includes(q) || r.phone.includes(q);
    const matchesGroup = !groupFilter || r.group === groupById.get(groupFilter)?.name;
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesCredit = !creditOnly || r.creditLimit > 0;
    return matchesQuery && matchesGroup && matchesStatus && matchesCredit;
  });

  const kpis = useMemo(() => {
    const now = new Date();
    const total = masterCustomers.length;
    const active = masterCustomers.filter((c) => c.status === "active").length;
    const newThisMonth = masterCustomers.filter((c) => {
      const created = new Date(c.createdDate);
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
    }).length;
    const creditCustomers = masterCustomers.filter((c) => c.allowCredit).length;
    const outstanding = rows.reduce((sum, r) => sum + r.outstanding, 0);
    return { total, active, newThisMonth, creditCustomers, outstanding };
  }, [masterCustomers, rows]);

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Every customer's orders, purchases, and outstanding balance, in one place."
        actions={
          <>
            <Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} aria-label="Filter by group">
              <option value="">All groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <CheckboxField
              id="credit-only"
              label="Credit only"
              checked={creditOnly}
              onChange={(e) => setCreditOnly(e.target.checked)}
            />
            <SearchInput placeholder="Search name or mobile…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search customers" />
            <Link href="/customers/new">
              <Button>
                <HiOutlinePlus className="h-5 w-5" />
                Add Customer
              </Button>
            </Link>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile label="Total Customers" value={String(kpis.total)} icon={<HiOutlineUserGroup className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Active Customers" value={String(kpis.active)} icon={<HiOutlineCheckCircle className="h-5 w-5" />} tone="emerald" />
        <StatTile label="New This Month" value={String(kpis.newThisMonth)} icon={<HiOutlineUserPlus className="h-5 w-5" />} tone="sky" />
        <StatTile label="Credit Customers" value={String(kpis.creditCustomers)} icon={<HiOutlineCreditCard className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Outstanding" value={formatCurrency(kpis.outstanding)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="rose" />
      </div>

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Customer</Th>
            <Th>Contact</Th>
            <Th>Group</Th>
            <Th>Orders</Th>
            <Th>Total Spent</Th>
            <Th>Credit</Th>
            <Th>Outstanding</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={9} message="No customers found." />}
          {filtered.map((r) => (
            <TableRow key={r.key}>
              <Td>
                <Link href={`/customers/${encodeURIComponent(r.name)}`} className="font-medium text-ink hover:text-champagne-700">
                  {r.name}
                </Link>
              </Td>
              <Td>{r.phone}</Td>
              <Td>{r.group}</Td>
              <Td>{r.totalOrders}</Td>
              <Td>{formatCurrency(r.totalPurchases)}</Td>
              <Td>{r.creditLimit > 0 ? formatCurrency(r.creditLimit) : "—"}</Td>
              <Td className={r.outstanding > 0 ? "font-medium text-red-600" : ""}>{formatCurrency(r.outstanding)}</Td>
              <Td>
                <StatusSwitch
                  active={r.status === "active"}
                  name={r.name}
                  onChange={r.hasMaster ? (active) => dispatch(setCustomerStatus({ id: r.key, status: active ? "active" : "inactive" })) : undefined}
                />
              </Td>
              <Td className="text-right">
                {r.hasMaster && (
                  <IconButton
                    label={`Edit ${r.name}`}
                    onClick={() => router.push(`/customers/${encodeURIComponent(r.name)}/edit`)}
                  >
                    <HiOutlinePencil className="h-4 w-4" />
                  </IconButton>
                )}
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
