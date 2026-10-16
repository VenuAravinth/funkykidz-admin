import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { SupplierForm } from "@/components/organisms/SupplierForm";

export const metadata: Metadata = {
  title: "Add Supplier — Supplier Management",
};

export default function AddSupplierPage() {
  return (
    <div>
      <PageHeader
        title="Add Supplier"
        subtitle="Create a new supplier profile."
        backHref="/suppliers"
        backLabel="Back to Suppliers"
      />
      <Card className="max-w-4xl p-6">
        <SupplierForm mode="create" />
      </Card>
    </div>
  );
}
