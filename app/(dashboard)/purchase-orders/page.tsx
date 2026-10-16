import type { Metadata } from "next";
import Link from "next/link";
import { HiOutlinePlus } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { purchaseOrders, poTotal } from "@/lib/dummy-data/suppliers";
import type { POStatus } from "@/types/supplier";

export const metadata: Metadata = {
  title: "Purchase Orders — Supplier Management",
};

export default async function PurchaseOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "pending" } = await searchParams;
  const activeStatus = status as POStatus;

  const filtered = purchaseOrders.filter((po) => po.status === activeStatus);

  const countFor = (s: POStatus) => purchaseOrders.filter((po) => po.status === s).length;

  const tabs = [
    { label: "Pending", href: "/purchase-orders?status=pending", active: activeStatus === "pending", count: countFor("pending") },
    { label: "Partial", href: "/purchase-orders?status=partial", active: activeStatus === "partial", count: countFor("partial") },
    { label: "Received", href: "/purchase-orders?status=received", active: activeStatus === "received", count: countFor("received") },
    { label: "Cancelled", href: "/purchase-orders?status=cancelled", active: activeStatus === "cancelled", count: countFor("cancelled") },
  ];

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        subtitle="Track and manage orders raised with suppliers."
        actions={
          <Link href="/purchase-orders/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Create PO
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
            <Th>PO Number</Th>
            <Th>Supplier</Th>
            <Th>Order Date</Th>
            <Th>Expected Delivery</Th>
            <Th>Status</Th>
            <Th>Total</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={6} message={`No ${activeStatus} purchase orders.`} />}
          {filtered.map((po) => (
            <TableRow key={po.id}>
              <Td>
                <Link href={`/purchase-orders/${po.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {po.poNumber}
                </Link>
              </Td>
              <Td>
                <Link href={`/suppliers/${po.supplierId}`} className="hover:text-champagne-700">
                  {po.supplierName}
                </Link>
              </Td>
              <Td>{formatDate(po.orderDate)}</Td>
              <Td>{formatDate(po.expectedDeliveryDate)}</Td>
              <Td>
                <StatusBadge status={po.status} />
              </Td>
              <Td>{formatCurrency(poTotal(po))}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
