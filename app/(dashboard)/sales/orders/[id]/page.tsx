"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { HiOutlinePencil } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { SalesOrderActions } from "@/components/organisms/SalesOrderActions";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { salesOrderSubtotal, salesOrderTotal } from "@/lib/dummy-data/salesOrders";
import { getQuotationById } from "@/lib/dummy-data/quotations";
import { useAppSelector } from "@/stores/hooks";
import { selectSalesOrderById } from "@/stores/slices/salesOrdersSlice";
import { selectInvoiceBySalesOrderId } from "@/stores/slices/invoicesSlice";

export default function SalesOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const order = useAppSelector(selectSalesOrderById(id));
  const resultingInvoice = useAppSelector(selectInvoiceBySalesOrderId(id));

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

  const subtotal = salesOrderSubtotal(order);
  const discountAmount = subtotal * (order.discount / 100);
  const taxAmount = (subtotal - discountAmount) * (order.tax / 100);
  const total = salesOrderTotal(order);
  const sourceQuotation = order.quotationId ? getQuotationById(order.quotationId) : undefined;

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title={order.soNumber}
          subtitle={`Created on ${formatDate(order.createdDate)} for ${order.customerName}`}
          backHref="/sales/orders"
          backLabel="Back to Sales Orders"
          actions={
            <>
              <Link href={`/sales/orders/${order.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <HiOutlinePencil className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <SalesOrderActions order={order} />
            </>
          }
        />
      </div>

      <div className="print-area grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Customer</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Status</dt>
              <dd>
                <StatusBadge status={order.status} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Customer</dt>
              <dd className="font-medium text-ink">{order.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Created</dt>
              <dd className="font-medium text-ink">{formatDate(order.createdDate)}</dd>
            </div>
            {sourceQuotation && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">From Quotation</dt>
                <dd>
                  <Link href={`/sales/quotations/${sourceQuotation.id}`} className="font-medium text-champagne-600 hover:text-champagne-700 no-print">
                    {sourceQuotation.quotationNumber}
                  </Link>
                  <span className="hidden print:inline">{sourceQuotation.quotationNumber}</span>
                </dd>
              </div>
            )}
            {resultingInvoice && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Invoice</dt>
                <dd>
                  <Link href={`/sales/invoices/${resultingInvoice.id}`} className="font-medium text-champagne-600 hover:text-champagne-700 no-print">
                    {resultingInvoice.invoiceNumber}
                  </Link>
                  <span className="hidden print:inline">{resultingInvoice.invoiceNumber}</span>
                </dd>
              </div>
            )}
          </dl>

          <h3 className="mb-3 mt-6 border-t border-glass-border pt-4 text-sm font-semibold text-ink">Delivery</h3>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Fulfillment</dt>
              <dd>
                <StatusBadge status={order.fulfillmentStatus} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Delivery Date</dt>
              <dd className="font-medium text-ink">{formatDate(order.deliveryDate)}</dd>
            </div>
          </dl>

          <h3 className="mb-3 mt-6 border-t border-glass-border pt-4 text-sm font-semibold text-ink">Payment</h3>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Status</dt>
              <dd>
                <StatusBadge status={order.paymentStatus} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Paid</dt>
              <dd className="font-medium text-ink">{formatCurrency(order.paidAmount)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Balance</dt>
              <dd className="font-medium text-ink">{formatCurrency(Math.max(total - order.paidAmount, 0))}</dd>
            </div>
          </dl>

          {order.notes && (
            <div className="mt-6 border-t border-glass-border pt-4">
              <h3 className="mb-1 text-sm font-semibold text-ink">Notes</h3>
              <p className="text-sm text-ink">{order.notes}</p>
            </div>
          )}
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
              {order.items.map((item) => (
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
                <span className="text-ink-muted">Discount ({order.discount}%)</span>
                <span className="font-medium text-ink">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Tax ({order.tax}%)</span>
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
