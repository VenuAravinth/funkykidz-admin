"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { HiOutlinePencil } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { QuotationActions } from "@/components/organisms/QuotationActions";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { quotationSubtotal, quotationTotal } from "@/lib/dummy-data/quotations";
import { getEstimationById } from "@/lib/dummy-data/estimations";
import { useAppSelector } from "@/stores/hooks";
import { selectQuotationById } from "@/stores/slices/quotationsSlice";
import { selectSalesOrderByQuotationId } from "@/stores/slices/salesOrdersSlice";

export default function QuotationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const quotation = useAppSelector(selectQuotationById(id));
  const resultingOrder = useAppSelector(selectSalesOrderByQuotationId(id));

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

  const subtotal = quotationSubtotal(quotation);
  const discountAmount = subtotal * (quotation.discount / 100);
  const taxAmount = (subtotal - discountAmount) * (quotation.tax / 100);
  const total = quotationTotal(quotation);
  const sourceEstimation = quotation.estimationId ? getEstimationById(quotation.estimationId) : undefined;

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title={quotation.quotationNumber}
          subtitle={`Created on ${formatDate(quotation.createdDate)} for ${quotation.customerName}`}
          backHref="/sales/quotations"
          backLabel="Back to Quotations"
          actions={
            <>
              <Link href={`/sales/quotations/${quotation.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <HiOutlinePencil className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <QuotationActions quotation={quotation} />
            </>
          }
        />
      </div>

      <div className="print-area grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Quotation Summary</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Status</dt>
              <dd>
                <StatusBadge status={quotation.status} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Customer</dt>
              <dd className="font-medium text-ink">{quotation.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Salesperson</dt>
              <dd className="font-medium text-ink">{quotation.salesperson}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Created</dt>
              <dd className="font-medium text-ink">{formatDate(quotation.createdDate)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Valid Until</dt>
              <dd className="font-medium text-ink">{formatDate(quotation.validUntil)}</dd>
            </div>
            {sourceEstimation && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">From Estimation</dt>
                <dd>
                  <Link href={`/sales/estimations/${sourceEstimation.id}`} className="font-medium text-champagne-600 hover:text-champagne-700 no-print">
                    {sourceEstimation.estimationNumber}
                  </Link>
                  <span className="hidden print:inline">{sourceEstimation.estimationNumber}</span>
                </dd>
              </div>
            )}
            {resultingOrder && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Sales Order</dt>
                <dd>
                  <Link href={`/sales/orders/${resultingOrder.id}`} className="font-medium text-champagne-600 hover:text-champagne-700 no-print">
                    {resultingOrder.soNumber}
                  </Link>
                  <span className="hidden print:inline">{resultingOrder.soNumber}</span>
                </dd>
              </div>
            )}
            {quotation.notes && (
              <div className="border-t border-glass-border pt-3">
                <dt className="mb-1 text-ink-muted">Notes</dt>
                <dd className="text-ink">{quotation.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="xl:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-ink">Products</h2>
          <Table paginate={false}>
            <TableHead>
              <TableRow>
                <Th>Product</Th>
                <Th>Quantity</Th>
                <Th>Price</Th>
                <Th>Line Total</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {quotation.items.map((item) => (
                <TableRow key={item.id}>
                  <Td>{item.product}</Td>
                  <Td>{item.quantity}</Td>
                  <Td>{formatCurrency(item.unitPrice)}</Td>
                  <Td>{formatCurrency(item.quantity * item.unitPrice)}</Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs rounded-xl border border-glass-border bg-white/50 p-4 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Subtotal</span>
                <span className="font-medium text-ink">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Discount ({quotation.discount}%)</span>
                <span className="font-medium text-ink">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Tax ({quotation.tax}%)</span>
                <span className="font-medium text-ink">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-glass-border pt-2">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-lg font-semibold text-champagne-700">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
