import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { EstimationForm } from "@/components/organisms/EstimationForm";

export const metadata: Metadata = {
  title: "Create Estimation — Supplier Management",
};

export default function CreateEstimationPage() {
  return (
    <div>
      <PageHeader
        title="Create Estimation"
        subtitle="Put together an approximate quote for a customer."
        backHref="/sales/estimations"
        backLabel="Back to Estimations"
      />
      <Card className="max-w-5xl p-6">
        <EstimationForm />
      </Card>
    </div>
  );
}
