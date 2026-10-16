import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPurchaseOrderById, poSubtotal, poTotal } from "@/lib/dummy-data/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const po = getPurchaseOrderById(id);
  return { title: po ? `${po.poNumber} — Supplier Management` : "Purchase Order — Supplier Management" };
}

export default async function PurchaseOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const po = getPurchaseOrderById(id);
  if (!po) notFound();

  const subtotal = poSubtotal(po);
  const total = poTotal(po);

  return (
    <div>
      <PageHeader
        title={po.poNumber}
        subtitle={`Raised on ${formatDate(po.orderDate)}`}
        backHref="/purchase-orders"
        backLabel="Back to Purchase Orders"
        actions={
          <>
            {(po.status === "pending" || po.status === "partial") && (
              <Link href={`/goods-received/new?poId=${po.id}`}>
                <Button variant="secondary" size="sm">
                  Receive Stock
                </Button>
              </Link>
            )}
            <Link href={`/payments?status=pending`}>
              <Button variant="secondary" size="sm">
                View Payments
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Order Summary</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Status</dt>
              <dd>
                <StatusBadge status={po.status} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Supplier</dt>
              <dd>
                <Link href={`/suppliers/${po.supplierId}`} className="font-medium text-ink hover:text-champagne-700">
                  {po.supplierName}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Order Date</dt>
              <dd className="font-medium text-ink">{formatDate(po.orderDate)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Expected Delivery</dt>
              <dd className="font-medium text-ink">{formatDate(po.expectedDeliveryDate)}</dd>
            </div>
            {po.notes && (
              <div className="border-t border-glass-border pt-3">
                <dt className="mb-1 text-ink-muted">Notes</dt>
                <dd className="text-ink">{po.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="xl:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-ink">Line Items</h2>
          <Table paginate={false}>
            <TableHead>
              <TableRow>
                <Th>Description</Th>
                <Th>Barcode</Th>
                <Th>Ordered</Th>
                <Th>Received</Th>
                <Th>Unit Price</Th>
                <Th>Line Total</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {po.items.map((item) => (
                <TableRow key={item.id}>
                  <Td>{item.description}</Td>
                  <Td>{item.barcode}</Td>
                  <Td>{item.quantity}</Td>
                  <Td>{item.receivedQuantity}</Td>
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
                <span className="text-ink-muted">Tax ({po.tax}%)</span>
                <span className="font-medium text-ink">{formatCurrency(subtotal * (po.tax / 100))}</span>
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
