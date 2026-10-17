"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Spinner } from "@/components/atoms/Spinner";
import { FormAlert } from "@/components/molecules/FormAlert";
import { useUsers } from "@/features/users/hooks";
import { UserEditForm } from "@/components/organisms/UserEditForm";
import { useAppSelector } from "@/stores/hooks";
import { selectUserById } from "@/stores/slices/usersSlice";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoading, error } = useUsers();
  const user = useAppSelector((state) => selectUserById(state, id));

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
        title={`Edit User — ${user.username}`}
        backHref={`/users-access/users/${user.id}`}
        backLabel="Back to User Details"
      />
      <Card className="max-w-4xl p-6">
        <UserEditForm user={user} />
      </Card>
    </div>
  );
}
