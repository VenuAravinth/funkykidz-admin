"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { InvoiceForm } from "@/components/organisms/InvoiceForm";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoiceById } from "@/stores/slices/invoicesSlice";

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const invoice = useAppSelector(selectInvoiceById(id));

  if (!invoice) {
    return (
      <div>
        <PageHeader title="Invoice not found" backHref="/sales/invoices" backLabel="Back to Invoices" />
        <p className="text-sm text-ink-muted">
          This invoice may have been removed, or the link is out of date.{" "}
          <Link href="/sales/invoices" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the invoices list.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${invoice.invoiceNumber}`}
        subtitle="Update this invoice."
        backHref={`/sales/invoices/${invoice.id}`}
        backLabel="Back to Invoice"
      />
      <Card className="max-w-5xl p-6">
        <InvoiceForm invoice={invoice} />
      </Card>
    </div>
  );
}
