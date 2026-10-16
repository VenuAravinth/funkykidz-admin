"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Button } from "@/components/atoms/Button";
import { RoleFormModal } from "@/components/organisms/RoleFormModal";
import { PermissionEditor } from "@/components/organisms/PermissionEditor";
import { useAppSelector } from "@/stores/hooks";
import { selectRoleById } from "@/stores/slices/rolesSlice";

export default function RoleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const role = useAppSelector((state) => selectRoleById(state, id));
  const [editOpen, setEditOpen] = useState(false);

  if (!role) {
    return (
      <div>
        <PageHeader title="Role not found" backHref="/users-access/roles" backLabel="Back to Roles" />
        <p className="text-sm text-ink-muted">
          <Link href="/users-access/roles" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the role list.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={role.name}
        subtitle={role.description || "Assign this role's permissions below."}
        backHref="/users-access/roles"
        backLabel="Back to Roles"
        actions={
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <HiOutlinePencilSquare className="h-4 w-4" />
            Edit Role
          </Button>
        }
      />

      <PermissionEditor role={role} />

      <RoleFormModal open={editOpen} role={role} onClose={() => setEditOpen(false)} />
    </div>
  );
}
