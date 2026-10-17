"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Spinner } from "@/components/atoms/Spinner";
import { FormAlert } from "@/components/molecules/FormAlert";
import { UserStatusSwitch } from "@/components/organisms/UserStatusSwitch";
import { UserActions } from "@/components/organisms/UserActions";
import { formatDate, formatDateTime } from "@/lib/format";
import { useUsers } from "@/features/users/hooks";
import { useAppSelector } from "@/stores/hooks";
import { selectUserById } from "@/stores/slices/usersSlice";
import { selectRoleById } from "@/stores/slices/rolesSlice";
import { selectStaffById } from "@/stores/slices/staffSlice";
import { staffFullName } from "@/types/staff";

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoading, error } = useUsers();
  const user = useAppSelector((state) => selectUserById(state, id));
  const [message, setMessage] = useState<{ variant: "success" | "error"; text: string } | null>(null);
  const role = useAppSelector((state) => (user ? selectRoleById(state, user.roleId) : undefined));
  const staffMember = useAppSelector((state) => (user?.staffId ? selectStaffById(state, user.staffId) : undefined));

  if (!user && isLoading) {
    return (
      <div className="flex justify-center py-16 text-champagne-600">
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <PageHeader title="User not found" backHref="/users-access/users" backLabel="Back to Users" />
        {error && <FormAlert variant="error" className="mb-4">{error}</FormAlert>}
        <p className="text-sm text-ink-muted">
          <Link href="/users-access/users" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the user list.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={user.username}
        subtitle={role?.name ?? "No role assigned"}
        backHref="/users-access/users"
        backLabel="Back to Users"
        actions={<UserActions user={user} onMessage={setMessage} />}
      />

      {message && (
        <FormAlert variant={message.variant} className="mb-4 max-w-2xl">
          {message.text}
        </FormAlert>
      )}

      <Card className="max-w-2xl p-6">
        <h2 className="mb-4 text-base font-semibold text-ink">Account Details</h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Status</dt>
            <dd>
              <UserStatusSwitch user={user} onError={(text) => setMessage({ variant: "error", text })} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Two-Factor Authentication</dt>
            <dd className="text-right font-medium text-ink">{user.mfaEnabled ? "Enabled" : "Set up at next sign-in"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Email</dt>
            <dd className="text-right font-medium text-ink">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Role</dt>
            <dd className="text-right font-medium text-ink">{role?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Staff Member</dt>
            <dd className="text-right font-medium text-ink">
              {staffMember ? (
                <Link href={`/users-access/staff/${staffMember.id}`} className="text-champagne-600 hover:text-champagne-700">
                  {staffFullName(staffMember)}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Last Login</dt>
            <dd className="text-right font-medium text-ink">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Last Password Reset</dt>
            <dd className="text-right font-medium text-ink">
              {user.lastPasswordResetAt ? formatDateTime(user.lastPasswordResetAt) : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Created</dt>
            <dd className="text-right font-medium text-ink">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
