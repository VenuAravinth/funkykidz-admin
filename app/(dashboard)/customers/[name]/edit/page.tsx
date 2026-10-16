"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { CustomerForm } from "@/components/organisms/CustomerForm";
import { useAppSelector } from "@/stores/hooks";
import { selectCustomerByName } from "@/stores/slices/customersSlice";

export default function EditCustomerPage() {
  const { name } = useParams<{ name: string }>();
  const customerName = decodeURIComponent(name);
  const customer = useAppSelector((state) => selectCustomerByName(state, customerName));

  if (!customer) {
    return (
      <div>
        <PageHeader title="Customer not found" backHref="/customers" backLabel="Back to Customers" />
        <p className="text-sm text-ink-muted">
          This customer has no master record to edit yet.{" "}
          <Link href="/customers" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the customer list.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit Customer — ${customer.name}`}
        subtitle={customer.phone}
        backHref={`/customers/${encodeURIComponent(customer.name)}`}
        backLabel="Back to Customer Details"
      />
      <Card className="max-w-4xl p-6">
        <CustomerForm mode="edit" customer={customer} />
      </Card>
    </div>
  );
}
