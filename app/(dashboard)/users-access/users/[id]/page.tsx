"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { UserStatusSwitch } from "@/components/organisms/UserStatusSwitch";
import { UserActions } from "@/components/organisms/UserActions";
import { formatDateTime } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectUserById } from "@/stores/slices/usersSlice";
import { selectRoleById } from "@/stores/slices/rolesSlice";
import { selectStaffById } from "@/stores/slices/staffSlice";
import { staffFullName } from "@/types/staff";

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector((state) => selectUserById(state, id));
  const role = useAppSelector((state) => (user ? selectRoleById(state, user.roleId) : undefined));
  const staffMember = useAppSelector((state) => (user?.staffId ? selectStaffById(state, user.staffId) : undefined));

  if (!user) {
    return (
      <div>
        <PageHeader title="User not found" backHref="/users-access/users" backLabel="Back to Users" />
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
        actions={<UserActions user={user} />}
      />

      <Card className="max-w-2xl p-6">
        <h2 className="mb-4 text-base font-semibold text-ink">Account Details</h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Status</dt>
            <dd>
              <UserStatusSwitch user={user} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Online</dt>
            <dd className="font-medium text-ink">{user.isOnline ? "Yes" : "No"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Email</dt>
            <dd className="text-right font-medium text-ink">{user.email ?? "—"}</dd>
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
            <dd className="text-right font-medium text-ink">{user.createdDate}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
