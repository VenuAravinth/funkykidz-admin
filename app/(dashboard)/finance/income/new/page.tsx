import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { IncomeForm } from "@/components/organisms/IncomeForm";

export const metadata: Metadata = {
  title: "Add Income — Finance",
};

export default function AddIncomePage() {
  return (
    <div>
      <PageHeader title="Add Income" subtitle="Log money received into the business." backHref="/finance/income" backLabel="Back to Income" />
      <Card className="max-w-3xl p-6">
        <IncomeForm />
      </Card>
    </div>
  );
}
