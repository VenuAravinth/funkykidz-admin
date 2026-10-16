import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { ReturnForm } from "@/components/organisms/ReturnForm";

export const metadata: Metadata = {
  title: "Request Return — Supplier Management",
};

export default function CreateReturnPage() {
  return (
    <div>
      <PageHeader
        title="Request Return"
        subtitle="Find the invoice, select the product, and record why it's coming back."
        backHref="/sales/returns"
        backLabel="Back to Returns"
      />
      <Card className="max-w-3xl p-6">
        <Suspense fallback={null}>
          <ReturnForm />
        </Suspense>
      </Card>
    </div>
  );
}
