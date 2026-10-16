import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { POForm } from "@/components/organisms/POForm";

export const metadata: Metadata = {
  title: "Create Purchase Order — Supplier Management",
};

export default function CreatePOPage() {
  return (
    <div>
      <PageHeader
        title="Create Purchase Order"
        subtitle="Raise a new purchase order with a supplier."
        backHref="/purchase-orders"
        backLabel="Back to Purchase Orders"
      />
      <Card className="max-w-5xl p-6">
        <Suspense fallback={null}>
          <POForm />
        </Suspense>
      </Card>
    </div>
  );
}
