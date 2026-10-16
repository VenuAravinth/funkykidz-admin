import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { CashMovementForm } from "@/components/organisms/CashMovementForm";

export const metadata: Metadata = {
  title: "Add Cash Movement — Finance",
};

export default function AddCashMovementPage() {
  return (
    <div>
      <PageHeader title="Add Cash Movement" subtitle="Move cash between the till and a bank account." backHref="/finance/cash" backLabel="Back to Cash Management" />
      <Card className="max-w-3xl p-6">
        <CashMovementForm />
      </Card>
    </div>
  );
}
