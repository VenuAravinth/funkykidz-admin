"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { HiOutlinePencilSquare, HiOutlineKey } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectStaffById } from "@/stores/slices/staffSlice";
import { useUsers } from "@/features/users/hooks";
import { staffFullName } from "@/types/staff";

export default function StaffDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const staff = useAppSelector((state) => selectStaffById(state, id));
  const { users } = useUsers();
  const linkedUser = staff ? users.find((u) => u.staffId === staff.id) : undefined;

  if (!staff) {
    return (
      <div>
        <PageHeader title="Staff not found" backHref="/users-access/staff" backLabel="Back to Staff" />
        <p className="text-sm text-ink-muted">
          <Link href="/users-access/staff" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the staff list.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={staffFullName(staff)}
        subtitle={staff.designation ? `${staff.designation} · ${staff.department ?? "—"}` : staff.department}
        backHref="/users-access/staff"
        backLabel="Back to Staff"
        actions={
          <>
            <Link href={`/users-access/staff/${staff.id}/edit`}>
              <Button variant="secondary" size="sm">
                <HiOutlinePencilSquare className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            {linkedUser ? (
              <Link href={`/users-access/users/${linkedUser.id}`}>
                <Button variant="secondary" size="sm">
                  <HiOutlineKey className="h-4 w-4" />
                  View ERP Login
                </Button>
              </Link>
            ) : (
              <Link href={`/users-access/users/new?staffId=${staff.id}`}>
                <Button size="sm">
                  <HiOutlineKey className="h-4 w-4" />
                  Create Login
                </Button>
              </Link>
            )}
          </>
        }
      />

      <Card className="max-w-2xl p-6">
        <h2 className="mb-4 text-base font-semibold text-ink">Staff Information</h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Status</dt>
            <dd>
              <StatusBadge status={staff.employmentStatus} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Employee ID</dt>
            <dd className="font-medium text-ink">{staff.employeeId}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Phone</dt>
            <dd className="font-medium text-ink">{staff.phone}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Email</dt>
            <dd className="text-right font-medium text-ink">{staff.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Department</dt>
            <dd className="text-right font-medium text-ink">{staff.department ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Joining Date</dt>
            <dd className="text-right font-medium text-ink">{staff.joiningDate ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Salary</dt>
            <dd className="text-right font-medium text-ink">{staff.salary ? formatCurrency(staff.salary) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Address</dt>
            <dd className="text-right font-medium text-ink">{staff.address ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Emergency Contact</dt>
            <dd className="text-right font-medium text-ink">{staff.emergencyContact ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">ERP Login</dt>
            <dd className="text-right font-medium text-ink">{linkedUser ? linkedUser.username : "None"}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
