"use client";

import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { StaffForm } from "@/components/organisms/StaffForm";

export default function AddStaffPage() {
  return (
    <div>
      <PageHeader
        title="Add Staff"
        subtitle="Create a new employee record."
        backHref="/users-access/staff"
        backLabel="Back to Staff"
      />
      <Card className="max-w-4xl p-6">
        <StaffForm mode="create" />
      </Card>
    </div>
  );
}
