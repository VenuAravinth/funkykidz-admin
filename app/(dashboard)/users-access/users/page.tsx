"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  HiOutlinePlus,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineNoSymbol,
  HiOutlineSignal,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { StatTile } from "@/components/molecules/StatTile";
import { UserStatusSwitch } from "@/components/organisms/UserStatusSwitch";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { timeAgo } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectUsers } from "@/stores/slices/usersSlice";
import { selectRoles } from "@/stores/slices/rolesSlice";
import { selectStaff } from "@/stores/slices/staffSlice";
import { staffFullName } from "@/types/staff";

export default function UsersPage() {
  const users = useAppSelector(selectUsers);
  const roles = useAppSelector(selectRoles);
  const staff = useAppSelector(selectStaff);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const roleById = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);
  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  const total = users.length;
  const active = users.filter((u) => u.status === "active").length;
  const inactive = users.filter((u) => u.status === "inactive").length;
  const online = users.filter((u) => u.isOnline).length;

  const filtered = users.filter((u) => {
    const matchesQuery =
      !query ||
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(query.toLowerCase());
    const matchesRole = !roleFilter || u.roleId === roleFilter;
    const matchesStatus = !statusFilter || u.status === statusFilter;
    return matchesQuery && matchesRole && matchesStatus;
  });

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage ERP login accounts."
        actions={
          <>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <SearchInput
              placeholder="Search by username or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Link href="/users-access/users/new">
              <Button>
                <HiOutlinePlus className="h-4 w-4" />
                Add User
              </Button>
            </Link>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Users" value={String(total)} icon={<HiOutlineUsers className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Active Users" value={String(active)} icon={<HiOutlineCheckCircle className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Inactive Users" value={String(inactive)} icon={<HiOutlineNoSymbol className="h-5 w-5" />} tone="rose" />
        <StatTile label="Online Now" value={String(online)} icon={<HiOutlineSignal className="h-5 w-5" />} tone="sky" />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>User</Th>
            <Th>Username</Th>
            <Th>Role</Th>
            <Th>Staff</Th>
            <Th>Last Login</Th>
            <Th>Status</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={6} message="No users match your filters." />}
          {filtered.map((u) => {
            const role = roleById.get(u.roleId);
            const staffMember = u.staffId ? staffById.get(u.staffId) : undefined;
            return (
              <TableRow key={u.id}>
                <Td>
                  <Link href={`/users-access/users/${u.id}`} className="font-medium text-ink hover:text-champagne-700">
                    {u.username}
                  </Link>
                  {u.isOnline && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                    </span>
                  )}
                  <div className="text-xs text-ink-muted">{u.email ?? "—"}</div>
                </Td>
                <Td>{u.username}</Td>
                <Td>{role?.name ?? "—"}</Td>
                <Td>{staffMember ? staffFullName(staffMember) : "—"}</Td>
                <Td>{u.lastLoginAt ? timeAgo(u.lastLoginAt) : "Never"}</Td>
                <Td>
                  <UserStatusSwitch user={u} />
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
