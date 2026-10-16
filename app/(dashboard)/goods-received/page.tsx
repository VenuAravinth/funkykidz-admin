import type { Metadata } from "next";
import Link from "next/link";
import { HiOutlinePlus } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatDate } from "@/lib/format";
import { goodsReceipts } from "@/lib/dummy-data/suppliers";
import type { GoodsReceiptType } from "@/types/supplier";

export const metadata: Metadata = {
  title: "Goods Received — Supplier Management",
};

const VIEW_LABELS: Record<GoodsReceiptType, string> = {
  full: "Receive Stock",
  partial: "Partial Receive",
  damaged: "Damaged / Missing Items",
};

export default async function GoodsReceivedPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view = "full" } = await searchParams;
  const activeView = view as GoodsReceiptType;

  const filtered = goodsReceipts.filter((g) => g.type === activeView);
  const countFor = (t: GoodsReceiptType) => goodsReceipts.filter((g) => g.type === t).length;

  const tabs = (Object.keys(VIEW_LABELS) as GoodsReceiptType[]).map((t) => ({
    label: VIEW_LABELS[t],
    href: `/goods-received?view=${t}`,
    active: activeView === t,
    count: countFor(t),
  }));

  return (
    <div>
      <PageHeader
        title="Goods Received"
        subtitle="Inbound stock receipts against purchase orders."
        actions={
          <Link href="/goods-received/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Receive Stock
            </Button>
          </Link>
        }
      />

      <div className="mb-5">
        <SegmentedTabs tabs={tabs} />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>GRN</Th>
            <Th>PO Number</Th>
            <Th>Supplier</Th>
            <Th>Received Date</Th>
            <Th>Type</Th>
            <Th>Received By</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={6} message="No goods receipts in this view." />}
          {filtered.map((g) => (
            <TableRow key={g.id}>
              <Td>
                <Link href={`/goods-received/${g.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {g.grnNumber}
                </Link>
              </Td>
              <Td>
                <Link href={`/purchase-orders/${g.poId}`} className="hover:text-champagne-700">
                  {g.poNumber}
                </Link>
              </Td>
              <Td>{g.supplierName}</Td>
              <Td>{formatDate(g.receivedDate)}</Td>
              <Td>
                <StatusBadge status={g.type} />
              </Td>
              <Td>{g.receivedBy}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
