import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/atoms/Table";
import { formatDate } from "@/lib/format";
import { goodsReceipts } from "@/lib/dummy-data/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const receipt = goodsReceipts.find((g) => g.id === id);
  return { title: receipt ? `${receipt.grnNumber} — Supplier Management` : "Goods Receipt — Supplier Management" };
}

export default async function GoodsReceiptDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = goodsReceipts.find((g) => g.id === id);
  if (!receipt) notFound();

  return (
    <div>
      <PageHeader
        title={receipt.grnNumber}
        subtitle={`Received on ${formatDate(receipt.receivedDate)}`}
        backHref="/goods-received"
        backLabel="Back to Goods Received"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Receipt Summary</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Type</dt>
              <dd>
                <StatusBadge status={receipt.type} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Purchase Order</dt>
              <dd>
                <Link href={`/purchase-orders/${receipt.poId}`} className="font-medium text-ink hover:text-champagne-700">
                  {receipt.poNumber}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Supplier</dt>
              <dd>
                <Link href={`/suppliers/${receipt.supplierId}`} className="font-medium text-ink hover:text-champagne-700">
                  {receipt.supplierName}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Received By</dt>
              <dd className="font-medium text-ink">{receipt.receivedBy}</dd>
            </div>
            {receipt.remarks && (
              <div className="border-t border-glass-border pt-3">
                <dt className="mb-1 text-ink-muted">Remarks</dt>
                <dd className="text-ink">{receipt.remarks}</dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="xl:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-ink">Items</h2>
          <Table paginate={false}>
            <TableHead>
              <TableRow>
                <Th>Description</Th>
                <Th>Ordered</Th>
                <Th>Received</Th>
                <Th>Damaged</Th>
                <Th>Missing</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipt.items.map((item) => (
                <TableRow key={item.id}>
                  <Td>{item.description}</Td>
                  <Td>{item.orderedQty}</Td>
                  <Td>{item.receivedQty}</Td>
                  <Td>{item.damagedQty > 0 ? item.damagedQty : "—"}</Td>
                  <Td>{item.missingQty > 0 ? item.missingQty : "—"}</Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
