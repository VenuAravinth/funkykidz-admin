import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { SupplierForm } from "@/components/organisms/SupplierForm";
import { getSupplierById } from "@/lib/dummy-data/suppliers";

export const metadata: Metadata = {
  title: "Edit Supplier — Supplier Management",
};

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = getSupplierById(id);
  if (!supplier) notFound();

  return (
    <div>
      <PageHeader
        title={`Edit Supplier — ${supplier.name}`}
        subtitle={supplier.code}
        backHref={`/suppliers/${supplier.id}`}
        backLabel="Back to Supplier Details"
      />
      <Card className="max-w-4xl p-6">
        <SupplierForm mode="edit" supplier={supplier} />
      </Card>
    </div>
  );
}
