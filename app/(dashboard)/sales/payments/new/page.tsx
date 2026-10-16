import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { PaymentForm } from "@/components/organisms/PaymentForm";

export const metadata: Metadata = {
  title: "Record Payment — Supplier Management",
};

export default function RecordPaymentPage() {
  return (
    <div>
      <PageHeader title="Record Payment" subtitle="Log money received from a customer." backHref="/sales/payments" backLabel="Back to Payments" />
      <Card className="max-w-3xl p-6">
        <Suspense fallback={null}>
          <PaymentForm />
        </Suspense>
      </Card>
    </div>
  );
}
