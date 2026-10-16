import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { CustomerForm } from "@/components/organisms/CustomerForm";

export const metadata: Metadata = {
  title: "Add Customer — Customer Management",
};

export default function AddCustomerPage() {
  return (
    <div>
      <PageHeader
        title="Add Customer"
        subtitle="Create a new customer profile."
        backHref="/customers"
        backLabel="Back to Customers"
      />
      <Card className="max-w-4xl p-6">
        <CustomerForm mode="create" />
      </Card>
    </div>
  );
}
