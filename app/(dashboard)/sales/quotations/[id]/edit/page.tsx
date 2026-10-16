"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { QuotationForm } from "@/components/organisms/QuotationForm";
import { useAppSelector } from "@/stores/hooks";
import { selectQuotationById } from "@/stores/slices/quotationsSlice";

export default function EditQuotationPage() {
  const { id } = useParams<{ id: string }>();
  const quotation = useAppSelector(selectQuotationById(id));

  if (!quotation) {
    return (
      <div>
        <PageHeader title="Quotation not found" backHref="/sales/quotations" backLabel="Back to Quotations" />
        <p className="text-sm text-ink-muted">
          This quotation may have been removed, or the link is out of date.{" "}
          <Link href="/sales/quotations" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the quotations list.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${quotation.quotationNumber}`}
        subtitle="Update this quotation before it goes out to the customer."
        backHref={`/sales/quotations/${quotation.id}`}
        backLabel="Back to Quotation"
      />
      <Card className="max-w-5xl p-6">
        <QuotationForm quotation={quotation} />
      </Card>
    </div>
  );
}
