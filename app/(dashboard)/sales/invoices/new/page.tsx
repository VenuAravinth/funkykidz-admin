import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { InvoiceForm } from "@/components/organisms/InvoiceForm";

export const metadata: Metadata = {
  title: "Create Invoice — Supplier Management",
};

export default function CreateInvoicePage() {
  return (
    <div>
      <PageHeader
        title="Create Invoice"
        subtitle="Bill a customer for a confirmed order."
        backHref="/sales/invoices"
        backLabel="Back to Invoices"
      />
      <Card className="max-w-5xl p-6">
        <InvoiceForm />
      </Card>
    </div>
  );
}
