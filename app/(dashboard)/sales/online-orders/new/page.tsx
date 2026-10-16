import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { OnlineOrderForm } from "@/components/organisms/OnlineOrderForm";

export const metadata: Metadata = {
  title: "Create Online Order — Supplier Management",
};

export default function CreateOnlineOrderPage() {
  return (
    <div>
      <PageHeader
        title="Create Online Order"
        subtitle="Log an order manually (e.g. a phone or WhatsApp order)."
        backHref="/sales/online-orders"
        backLabel="Back to Online Orders"
      />
      <Card className="max-w-5xl p-6">
        <OnlineOrderForm />
      </Card>
    </div>
  );
}
