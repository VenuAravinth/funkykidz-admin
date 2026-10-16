import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { SalesOrderForm } from "@/components/organisms/SalesOrderForm";

export const metadata: Metadata = {
  title: "Create Sales Order — Supplier Management",
};

export default function CreateSalesOrderPage() {
  return (
    <div>
      <PageHeader
        title="Create Sales Order"
        subtitle="Record a confirmed customer order."
        backHref="/sales/orders"
        backLabel="Back to Sales Orders"
      />
      <Card className="max-w-5xl p-6">
        <SalesOrderForm />
      </Card>
    </div>
  );
}
