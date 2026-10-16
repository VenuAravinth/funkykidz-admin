"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { SalesOrderForm } from "@/components/organisms/SalesOrderForm";
import { useAppSelector } from "@/stores/hooks";
import { selectSalesOrderById } from "@/stores/slices/salesOrdersSlice";

export default function EditSalesOrderPage() {
  const { id } = useParams<{ id: string }>();
  const order = useAppSelector(selectSalesOrderById(id));

  if (!order) {
    return (
      <div>
        <PageHeader title="Sales order not found" backHref="/sales/orders" backLabel="Back to Sales Orders" />
        <p className="text-sm text-ink-muted">
          This sales order may have been removed, or the link is out of date.{" "}
          <Link href="/sales/orders" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the sales orders list.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${order.soNumber}`}
        subtitle="Update this sales order."
        backHref={`/sales/orders/${order.id}`}
        backLabel="Back to Sales Order"
      />
      <Card className="max-w-5xl p-6">
        <SalesOrderForm order={order} />
      </Card>
    </div>
  );
}
