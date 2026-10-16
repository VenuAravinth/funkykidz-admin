"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineBuildingStorefront,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineShoppingBag,
  HiOutlineViewColumns,
  HiOutlineXCircle,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { StockDetailModal, type StockDetailRow } from "@/components/organisms/StockDetailModal";
import { formatCurrency, formatDate } from "@/lib/format";
import { getSupplierById } from "@/lib/dummy-data/suppliers";
import { poHref, suggestedOrderQty } from "@/lib/reorder";
import { buildStockRows, type StockRow } from "@/lib/stockRows";
import { useAppSelector } from "@/stores/hooks";
import { selectBrands, selectCategories, selectProducts } from "@/stores/slices/catalogSlice";
import { selectStockMovements } from "@/stores/slices/stockMovementsSlice";
import type { StockMovement } from "@/types/stock";

const OPTIONAL_COLUMNS = [
  { key: "lastPurchase", label: "Last Purchase" },
  { key: "lastPurchasePrice", label: "Last Purchase Price" },
  { key: "daysOutOfStock", label: "Days Out of Stock" },
  { key: "onlineStatus", label: "Online Status" },
] as const;

type OptionalColumnKey = (typeof OPTIONAL_COLUMNS)[number]["key"];

function relativeDay(iso: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(iso);
  date.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return formatDate(iso);
}

function daysSince(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(iso);
  date.setHours(0, 0, 0, 0);
  return Math.max(Math.round((today.getTime() - date.getTime()) / 86_400_000), 0);
}

function latestByType(movements: StockMovement[], productId: string, type: StockMovement["type"]): StockMovement | undefined {
  return movements
    .filter((m) => m.productId === productId && m.type === type)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))[0];
}

function zeroOutMovement(movements: StockMovement[], productId: string): StockMovement | undefined {
  return movements
    .filter((m) => m.productId === productId && m.balanceAfter <= 0)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))[0];
}

export default function OutOfStockPage() {
  const router = useRouter();
  const products = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategories);
  const brands = useAppSelector(selectBrands);
  const movements = useAppSelector(selectStockMovements);

  const [viewRow, setViewRow] = useState<StockRow | undefined>(undefined);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<OptionalColumnKey>>(new Set(["daysOutOfStock"]));
  const columnsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!columnsOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(e.target as Node)) setColumnsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [columnsOpen]);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const brandById = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const outOfStock = useMemo(
    () => buildStockRows(products).filter((row) => row.tracked && row.available <= 0),
    [products],
  );

  const stats = useMemo(() => {
    const withZeroOut = outOfStock
      .map((row) => zeroOutMovement(movements, row.productId))
      .filter((m): m is StockMovement => !!m);
    const avgDays = withZeroOut.length
      ? Math.round(withZeroOut.reduce((sum, m) => sum + daysSince(m.date), 0) / withZeroOut.length)
      : 0;
    const restockCost = outOfStock.reduce((sum, row) => {
      const product = productById.get(row.productId);
      return product ? sum + suggestedOrderQty(product) * product.costPrice : sum;
    }, 0);
    return { count: outOfStock.length, avgDays, restockCost };
  }, [outOfStock, movements, productById]);

  const toggleColumn = (key: OptionalColumnKey) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toDetailRow = (row: StockRow): StockDetailRow => {
    const variant = productById.get(row.productId)?.variants.find((v) => v.id === row.variantId);
    return {
      name: row.name,
      barcode: row.barcode,
      category: categoryById.get(row.categoryId)?.name ?? "—",
      brand: (row.brandId && brandById.get(row.brandId)?.name) || "—",
      supplier: (row.supplierId && getSupplierById(row.supplierId)?.name) ?? "—",
      size: row.size,
      color: row.color,
      available: row.available,
      minStock: row.minStock,
      damaged: variant?.damagedStock ?? 0,
      reserved: variant?.reservedStock ?? 0,
      price: row.price,
    };
  };

  const extraColSpan = visibleColumns.size;

  return (
    <div>
      <PageHeader
        title="Out of Stock"
        subtitle="Products with zero sellable stock, ready to reorder."
        backHref="/inventory"
        backLabel="Inventory"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile
          label="Out of Stock Items"
          value={String(stats.count)}
          icon={<HiOutlineXCircle className="h-5 w-5" />}
          tone="rose"
        />
        <StatTile
          label="Avg. Days Out of Stock"
          value={String(stats.avgDays)}
          icon={<HiOutlineClock className="h-5 w-5" />}
          tone="champagne"
        />
        <StatTile
          label="Estimated Restock Cost"
          value={formatCurrency(stats.restockCost)}
          icon={<HiOutlineShoppingBag className="h-5 w-5" />}
          tone="sky"
        />
      </div>

      <div className="mb-3 flex justify-end">
        <div className="relative" ref={columnsMenuRef}>
          <Button variant="secondary" size="sm" onClick={() => setColumnsOpen((v) => !v)}>
            <HiOutlineViewColumns className="h-4 w-4" />
            Show columns
          </Button>
          {columnsOpen && (
            <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-glass-border bg-cream-50 p-4 shadow-xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Optional columns</p>
              <div className="flex flex-col gap-3">
                {OPTIONAL_COLUMNS.map((col) => (
                  <CheckboxField
                    key={col.key}
                    id={`col-${col.key}`}
                    label={col.label}
                    checked={visibleColumns.has(col.key)}
                    onChange={() => toggleColumn(col.key)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Product</Th>
            <Th>Colour</Th>
            <Th>Size</Th>
            <Th>Barcode</Th>
            <Th>Last Sold</Th>
            {visibleColumns.has("lastPurchase") && <Th>Last Purchase</Th>}
            {visibleColumns.has("lastPurchasePrice") && <Th>Last Purchase Price</Th>}
            {visibleColumns.has("daysOutOfStock") && <Th>Days Out of Stock</Th>}
            {visibleColumns.has("onlineStatus") && <Th>Online Status</Th>}
            <Th>Supplier</Th>
            <Th className="text-right">Action</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {outOfStock.length === 0 && (
            <TableEmpty colSpan={7 + extraColSpan} message="No products are currently out of stock." />
          )}
          {outOfStock.map((row) => {
            const product = productById.get(row.productId);
            const supplier = row.supplierId ? getSupplierById(row.supplierId) : undefined;
            const lastSale = latestByType(movements, row.productId, "Sale");
            const lastPurchase = latestByType(movements, row.productId, "Purchase");
            const zeroOut = zeroOutMovement(movements, row.productId);

            return (
              <TableRow key={row.key}>
                <Td>
                  <div className="font-medium text-ink">{row.name}</div>
                </Td>
                <Td>{row.color}</Td>
                <Td>{row.size}</Td>
                <Td className="font-mono text-xs text-ink-muted">{row.barcode}</Td>
                <Td>{lastSale ? relativeDay(lastSale.date) : "—"}</Td>
                {visibleColumns.has("lastPurchase") && <Td>{lastPurchase ? formatDate(lastPurchase.date) : "—"}</Td>}
                {visibleColumns.has("lastPurchasePrice") && <Td>{formatCurrency(row.costPrice)}</Td>}
                {visibleColumns.has("daysOutOfStock") && (
                  <Td className="font-medium text-red-600">{zeroOut ? `${daysSince(zeroOut.date)}d` : "—"}</Td>
                )}
                {visibleColumns.has("onlineStatus") && (
                  <Td>
                    <Badge tone={product?.published ? "warning" : "neutral"}>{product?.published ? "Published" : "Unpublished"}</Badge>
                  </Td>
                )}
                <Td>{supplier?.name ?? "—"}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <IconButton label={`View ${row.name}`} onClick={() => setViewRow(row)}>
                      <HiOutlineEye className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label={`View sales for ${row.name}`}
                      onClick={() => router.push(`/inventory/stock-movement?productId=${encodeURIComponent(row.productId)}`)}
                    >
                      <HiOutlineClock className="h-4 w-4" />
                    </IconButton>
                    {row.supplierId && (
                      <Link href={`/suppliers/${row.supplierId}`}>
                        <IconButton label={`View supplier for ${row.name}`}>
                          <HiOutlineBuildingStorefront className="h-4 w-4" />
                        </IconButton>
                      </Link>
                    )}
                    {product && (
                      <Link href={poHref(product)}>
                        <Button size="sm">Reorder</Button>
                      </Link>
                    )}
                  </div>
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <StockDetailModal open={!!viewRow} row={viewRow ? toDetailRow(viewRow) : undefined} onClose={() => setViewRow(undefined)} />
    </div>
  );
}
