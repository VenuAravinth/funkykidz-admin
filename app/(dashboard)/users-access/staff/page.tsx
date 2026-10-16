"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineNoSymbol,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { useAppSelector } from "@/stores/hooks";
import { selectStaff } from "@/stores/slices/staffSlice";
import { staffFullName } from "@/types/staff";

export default function StaffPage() {
  const staff = useAppSelector(selectStaff);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const total = staff.length;
  const active = staff.filter((s) => s.employmentStatus === "active").length;
  const onLeave = staff.filter((s) => s.employmentStatus === "on_leave").length;
  const inactive = staff.filter((s) => s.employmentStatus === "inactive").length;

  const departments = Array.from(new Set(staff.map((s) => s.department).filter(Boolean))) as string[];

  const filtered = staff.filter((s) => {
    const name = staffFullName(s).toLowerCase();
    const matchesQuery = !query || name.includes(query.toLowerCase()) || s.employeeId.toLowerCase().includes(query.toLowerCase());
    const matchesDept = !deptFilter || s.department === deptFilter;
    const matchesStatus = !statusFilter || s.employmentStatus === statusFilter;
    return matchesQuery && matchesDept && matchesStatus;
  });

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Employee and staff management."
        actions={
          <>
            <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </Select>
            <SearchInput
              placeholder="Search by name or employee ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Link href="/users-access/staff/new">
              <Button>
                <HiOutlinePlus className="h-4 w-4" />
                Add Staff
              </Button>
            </Link>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Staff" value={String(total)} icon={<HiOutlineUserGroup className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Active Staff" value={String(active)} icon={<HiOutlineCheckCircle className="h-5 w-5" />} tone="emerald" />
        <StatTile label="On Leave" value={String(onLeave)} icon={<HiOutlineClock className="h-5 w-5" />} tone="sky" />
        <StatTile label="Inactive" value={String(inactive)} icon={<HiOutlineNoSymbol className="h-5 w-5" />} tone="rose" />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Staff</Th>
            <Th>Employee ID</Th>
            <Th>Department</Th>
            <Th>Designation</Th>
            <Th>Phone</Th>
            <Th>Status</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={6} message="No staff match your filters." />}
          {filtered.map((s) => (
            <TableRow key={s.id}>
              <Td>
                <Link href={`/users-access/staff/${s.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {staffFullName(s)}
                </Link>
                {s.hasLogin && <div className="text-xs text-ink-muted">Has ERP login</div>}
              </Td>
              <Td>{s.employeeId}</Td>
              <Td>{s.department ?? "—"}</Td>
              <Td>{s.designation ?? "—"}</Td>
              <Td>{s.phone}</Td>
              <Td>
                <StatusBadge status={s.employmentStatus} />
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
