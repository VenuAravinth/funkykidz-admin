"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HiOutlineEye, HiOutlineExclamationTriangle, HiOutlineShoppingCart, HiOutlineSquares2X2 } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { Modal } from "@/components/molecules/Modal";
import { formatCurrency } from "@/lib/format";
import { getSupplierById } from "@/lib/dummy-data/suppliers";
import { poHref, suggestedOrderQty } from "@/lib/reorder";
import { useAppSelector } from "@/stores/hooks";
import { selectProducts } from "@/stores/slices/catalogSlice";
import type { Product } from "@/types/product";

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

export default function LowStockPage() {
  const products = useAppSelector(selectProducts);
  const [viewing, setViewing] = useState<Product | undefined>(undefined);

  const lowStock = useMemo(
    () =>
      products
        .filter((p) => p.inStock && p.lowStock)
        .sort((a, b) => a.stock / a.reorderLevel - b.stock / b.reorderLevel),
    [products],
  );

  const totalSuggestedUnits = useMemo(() => lowStock.reduce((sum, p) => sum + suggestedOrderQty(p), 0), [lowStock]);
  const estimatedCost = useMemo(
    () => lowStock.reduce((sum, p) => sum + suggestedOrderQty(p) * p.costPrice, 0),
    [lowStock],
  );

  return (
    <div>
      <PageHeader
        title="Low Stock"
        subtitle="What to purchase now, before it runs out."
        backHref="/inventory"
        backLabel="Inventory"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile
          label="Items Below Reorder Level"
          value={String(lowStock.length)}
          icon={<HiOutlineExclamationTriangle className="h-5 w-5" />}
          tone="rose"
        />
        <StatTile
          label="Suggested Units to Order"
          value={totalSuggestedUnits.toLocaleString("en-IN")}
          icon={<HiOutlineSquares2X2 className="h-5 w-5" />}
          tone="champagne"
        />
        <StatTile
          label="Estimated Reorder Cost"
          value={formatCurrency(estimatedCost)}
          icon={<HiOutlineShoppingCart className="h-5 w-5" />}
          tone="sky"
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Product</Th>
            <Th>Current</Th>
            <Th>Reorder Level</Th>
            <Th>Suggested Order</Th>
            <Th>Supplier</Th>
            <Th className="text-right">Action</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {lowStock.length === 0 && <TableEmpty colSpan={6} message="Nothing is below its reorder level right now." />}
          {lowStock.map((product) => {
            const supplier = product.supplierId ? getSupplierById(product.supplierId) : undefined;
            return (
              <TableRow key={product.id}>
                <Td>
                  <div className="font-medium text-ink">{product.name}</div>
                  <div className="text-xs text-ink-muted">{product.category}</div>
                </Td>
                <Td className="font-medium text-red-600">{product.stock}</Td>
                <Td>{product.reorderLevel}</Td>
                <Td className="font-medium text-ink">{suggestedOrderQty(product)}</Td>
                <Td>{supplier?.name ?? "—"}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <IconButton label={`View ${product.name}`} onClick={() => setViewing(product)}>
                      <HiOutlineEye className="h-4 w-4" />
                    </IconButton>
                    <Link href={poHref(product)}>
                      <Button size="sm">Create PO</Button>
                    </Link>
                  </div>
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {viewing && (
        <Modal open title={viewing.name} subtitle={viewing.category} onClose={() => setViewing(undefined)}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <DetailItem label="Current Stock" value={String(viewing.stock)} />
            <DetailItem label="Reorder Level" value={String(viewing.reorderLevel)} />
            <DetailItem label="Suggested Purchase" value={`${suggestedOrderQty(viewing)} units`} />
            <DetailItem label="Last Purchase Price" value={formatCurrency(viewing.costPrice)} />
            <DetailItem
              label="Supplier"
              value={(viewing.supplierId && getSupplierById(viewing.supplierId)?.name) ?? "—"}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Link href={poHref(viewing)}>
              <Button>Create Purchase Order</Button>
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}
