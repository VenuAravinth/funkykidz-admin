"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { StaffForm } from "@/components/organisms/StaffForm";
import { useAppSelector } from "@/stores/hooks";
import { selectStaffById } from "@/stores/slices/staffSlice";
import { staffFullName } from "@/types/staff";

export default function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const staff = useAppSelector((state) => selectStaffById(state, id));

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
        title={`Edit Staff — ${staffFullName(staff)}`}
        backHref={`/users-access/staff/${staff.id}`}
        backLabel="Back to Staff Details"
      />
      <Card className="max-w-4xl p-6">
        <StaffForm mode="edit" staff={staff} />
      </Card>
    </div>
  );
}
