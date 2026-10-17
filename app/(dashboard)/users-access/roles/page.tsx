"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HiOutlinePencil, HiOutlinePlus, HiOutlineShieldCheck } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatusSwitch } from "@/components/molecules/StatusSwitch";
import { DeleteButton } from "@/components/molecules/DeleteButton";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { RoleFormModal } from "@/components/organisms/RoleFormModal";
import { PERMISSION_CATALOG } from "@/lib/dummy-data/roles";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { deleteRole, selectRoles, setRoleStatus } from "@/stores/slices/rolesSlice";
import { useUsers } from "@/features/users/hooks";
import type { Role } from "@/types/role";

export default function RolesPage() {
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectRoles);
  const { users } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | undefined>(undefined);

  const totalPermissionItems = PERMISSION_CATALOG.reduce((sum, g) => sum + g.items.length, 0);

  const userCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const user of users) {
      counts.set(user.roleId, (counts.get(user.roleId) ?? 0) + 1);
    }
    return counts;
  }, [users]);

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setModalOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Roles"
        subtitle="A role is a collection of permissions."
        actions={
          <Button onClick={openCreate}>
            <HiOutlinePlus className="h-4 w-4" />
            Create Role
          </Button>
        }
      />

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Role</Th>
            <Th>Users</Th>
            <Th>Permissions</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.length === 0 && <TableEmpty colSpan={5} message="No roles configured yet." />}
          {roles.map((role) => {
            const userCount = userCounts.get(role.id) ?? 0;
            return (
              <TableRow key={role.id}>
                <Td>
                  <Link href={`/users-access/roles/${role.id}`} className="font-medium text-ink hover:text-champagne-700">
                    {role.name}
                  </Link>
                  <div className="max-w-xs truncate text-xs text-ink-muted">{role.description || "—"}</div>
                </Td>
                <Td>{userCount}</Td>
                <Td>
                  {role.permissionKeys.length === totalPermissionItems ? "All" : `${role.permissionKeys.length} / ${totalPermissionItems}`}
                </Td>
                <Td>
                  <StatusSwitch
                    active={role.status === "active"}
                    name={role.name}
                    onChange={(active) => dispatch(setRoleStatus({ id: role.id, status: active ? "active" : "inactive" }))}
                  />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/users-access/roles/${role.id}`}>
                      <IconButton label={`Assign permissions to ${role.name}`} title="Assign Permissions">
                        <HiOutlineShieldCheck className="h-4 w-4" />
                      </IconButton>
                    </Link>
                    <IconButton label={`Edit ${role.name}`} onClick={() => openEdit(role)}>
                      <HiOutlinePencil className="h-4 w-4" />
                    </IconButton>
                    <DeleteButton
                      itemLabel={role.name}
                      disabled={userCount > 0}
                      disabledReason={`Cannot delete — ${userCount} user(s) have this role.`}
                      description={`This will permanently remove ${role.name}. This action cannot be undone.`}
                      onDelete={() => dispatch(deleteRole(role.id))}
                    />
                  </div>
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <RoleFormModal open={modalOpen} role={editing} onClose={() => setModalOpen(false)} />
    </div>
  );
}
