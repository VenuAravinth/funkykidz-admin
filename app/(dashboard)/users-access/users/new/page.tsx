"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { UserForm } from "@/components/organisms/UserForm";

function AddUserContent() {
  const searchParams = useSearchParams();
  const staffId = searchParams.get("staffId") ?? undefined;

  return (
    <div>
      <PageHeader
        title="Add User"
        subtitle="Create a new ERP login account."
        backHref="/users-access/users"
        backLabel="Back to Users"
      />
      <Card className="max-w-4xl p-6">
        <UserForm defaultStaffId={staffId} />
      </Card>
    </div>
  );
}

export default function AddUserPage() {
  return (
    <Suspense fallback={null}>
      <AddUserContent />
    </Suspense>
  );
}
