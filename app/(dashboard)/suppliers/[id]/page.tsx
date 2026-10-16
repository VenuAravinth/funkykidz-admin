import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HiOutlinePencilSquare, HiOutlineStar } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { StatusSwitch } from "@/components/molecules/StatusSwitch";
import { DeactivateSupplierButton } from "@/components/organisms/DeactivateSupplierButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  getSupplierById,
  getPurchaseOrdersBySupplier,
  getPaymentsBySupplier,
  getGoodsReceiptsBySupplier,
  poTotal,
} from "@/lib/dummy-data/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supplier = getSupplierById(id);
  return { title: supplier ? `${supplier.name} — Supplier Management` : "Supplier — Supplier Management" };
}

export default async function SupplierDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = getSupplierById(id);
  if (!supplier) notFound();

  const orders = getPurchaseOrdersBySupplier(supplier.id);
  const payments = getPaymentsBySupplier(supplier.id);
  const receipts = getGoodsReceiptsBySupplier(supplier.id);

  return (
    <div>
      <PageHeader
        title={supplier.name}
        subtitle={`${supplier.code} · ${supplier.category}`}
        backHref="/suppliers"
        backLabel="Back to Suppliers"
        actions={
          <>
            <Link href={`/suppliers/${supplier.id}/edit`}>
              <Button variant="secondary" size="sm">
                <HiOutlinePencilSquare className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeactivateSupplierButton supplierName={supplier.name} status={supplier.status} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-1">
          <h2 className="mb-4 text-base font-semibold text-ink">Supplier Details</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Status</dt>
              <dd>
                <StatusSwitch active={supplier.status === "active"} name={supplier.name} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Rating</dt>
              <dd className="flex items-center gap-1 font-medium text-ink">
                <HiOutlineStar className="h-4 w-4 text-champagne-600" />
                {supplier.rating.toFixed(1)} / 5
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Contact Person</dt>
              <dd className="text-right font-medium text-ink">{supplier.contactPerson}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Email</dt>
              <dd className="text-right font-medium text-ink">{supplier.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Phone</dt>
              <dd className="text-right font-medium text-ink">{supplier.phone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">GST Number</dt>
              <dd className="text-right font-medium text-ink">{supplier.gstNumber}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Location</dt>
              <dd className="text-right font-medium text-ink">
                {supplier.city}, {supplier.state}, {supplier.country}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Payment Terms</dt>
              <dd className="text-right font-medium text-ink">{supplier.paymentTerms}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Joined</dt>
              <dd className="text-right font-medium text-ink">{formatDate(supplier.joinedDate)}</dd>
            </div>
            {supplier.notes && (
              <div className="border-t border-glass-border pt-3">
                <dt className="mb-1 text-ink-muted">Notes</dt>
                <dd className="text-ink">{supplier.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="flex flex-col gap-6 xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <p className="text-sm text-ink-muted">Total Purchases</p>
              <p className="mt-1 text-xl font-semibold text-ink">{formatCurrency(supplier.totalPurchases)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-ink-muted">Outstanding Amount</p>
              <p className="mt-1 text-xl font-semibold text-ink">{formatCurrency(supplier.outstandingAmount)}</p>
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Purchase Orders</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <Th>PO Number</Th>
                  <Th>Order Date</Th>
                  <Th>Status</Th>
                  <Th>Total</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 && <TableEmpty colSpan={4} />}
                {orders.map((po) => (
                  <TableRow key={po.id}>
                    <Td>
                      <Link href={`/purchase-orders/${po.id}`} className="font-medium text-ink hover:text-champagne-700">
                        {po.poNumber}
                      </Link>
                    </Td>
                    <Td>{formatDate(po.orderDate)}</Td>
                    <Td>
                      <StatusBadge status={po.status} />
                    </Td>
                    <Td>{formatCurrency(poTotal(po))}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Payments</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <Th>Reference</Th>
                  <Th>Invoice</Th>
                  <Th>Status</Th>
                  <Th>Due</Th>
                  <Th>Amount</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 && <TableEmpty colSpan={5} />}
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <Td>
                      <Link href={`/payments/${p.id}`} className="font-medium text-ink hover:text-champagne-700">
                        {p.paymentRef}
                      </Link>
                    </Td>
                    <Td>{p.invoiceNumber}</Td>
                    <Td>
                      <StatusBadge status={p.status} />
                    </Td>
                    <Td>{formatDate(p.dueDate)}</Td>
                    <Td>{formatCurrency(p.amount)}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Goods Received</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <Th>GRN</Th>
                  <Th>PO Number</Th>
                  <Th>Type</Th>
                  <Th>Received Date</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipts.length === 0 && <TableEmpty colSpan={4} />}
                {receipts.map((r) => (
                  <TableRow key={r.id}>
                    <Td>
                      <Link href={`/goods-received/${r.id}`} className="font-medium text-ink hover:text-champagne-700">
                        {r.grnNumber}
                      </Link>
                    </Td>
                    <Td>{r.poNumber}</Td>
                    <Td>
                      <StatusBadge status={r.type} />
                    </Td>
                    <Td>{formatDate(r.receivedDate)}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
