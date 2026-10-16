import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { QuotationForm } from "@/components/organisms/QuotationForm";

export const metadata: Metadata = {
  title: "Create Quotation — Supplier Management",
};

export default function CreateQuotationPage() {
  return (
    <div>
      <PageHeader
        title="Create Quotation"
        subtitle="Put together a formal price offer for a customer."
        backHref="/sales/quotations"
        backLabel="Back to Quotations"
      />
      <Card className="max-w-5xl p-6">
        <QuotationForm />
      </Card>
    </div>
  );
}
