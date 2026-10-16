"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineArrowPathRoundedSquare,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineLockClosed,
  HiOutlinePencil,
  HiOutlinePrinter,
  HiOutlineSquares2X2,
  HiOutlineWrenchScrewdriver,
  HiOutlineXCircle,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { StatTile } from "@/components/molecules/StatTile";
import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { AdjustStockModal, type AdjustStockTarget } from "@/components/organisms/AdjustStockModal";
import { StockDetailModal, type StockDetailRow } from "@/components/organisms/StockDetailModal";
import { formatCurrency } from "@/lib/format";
import { suppliers } from "@/lib/dummy-data/suppliers";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectBrands, selectCategories, selectProducts, selectVariants } from "@/stores/slices/catalogSlice";
import { adjustProductStock } from "@/features/products/api";
import { selectAuthUser } from "@/stores/slices/authSlice";
import { addMovement } from "@/stores/slices/stockMovementsSlice";
import { buildStockRows, type StockRow } from "@/lib/stockRows";

type StockStatus = "in-stock" | "low" | "out";

function statusOf(row: StockRow): StockStatus {
  if (!row.tracked) return "in-stock";
  if (row.available <= 0) return "out";
  if (row.available <= row.minStock) return "low";
  return "in-stock";
}

const STATUS_META: Record<StockStatus, { label: string; tone: "success" | "warning" | "danger" }> = {
  "in-stock": { label: "In Stock", tone: "success" },
  low: { label: "Low Stock", tone: "warning" },
  out: { label: "Out of Stock", tone: "danger" },
};

export default function StockOverviewPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const products = useAppSelector(selectProducts);
  const variants = useAppSelector(selectVariants);
  const categories = useAppSelector(selectCategories);
  const brands = useAppSelector(selectBrands);
  const authUser = useAppSelector(selectAuthUser);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [status, setStatus] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [viewRow, setViewRow] = useState<StockRow | undefined>(undefined);
  const [adjusting, setAdjusting] = useState<StockRow | undefined>(undefined);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const brandById = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);
  const supplierById = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), []);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const rows = useMemo(() => buildStockRows(products), [products]);

  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size))).sort(), [variants]);
  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color))).sort(), [variants]);

  const filtered = rows.filter((row) => {
    const matchesQuery =
      !query || row.name.toLowerCase().includes(query.toLowerCase()) || row.barcode.includes(query.trim());
    const matchesCategory = !categoryId || row.categoryId === categoryId;
    const matchesBrand = !brandId || row.brandId === brandId;
    const matchesSize = !size || row.size === size;
    const matchesColor = !color || row.color === color;
    const matchesStatus = !status || statusOf(row) === status;
    const matchesSupplier = !supplierId || row.supplierId === supplierId;
    const min = minPrice === "" ? -Infinity : Number(minPrice);
    const max = maxPrice === "" ? Infinity : Number(maxPrice);
    const matchesPrice = row.price >= min && row.price <= max;
    return matchesQuery && matchesCategory && matchesBrand && matchesSize && matchesColor && matchesStatus && matchesSupplier && matchesPrice;
  });

  const kpis = useMemo(() => {
    const totalUnits = rows.reduce((sum, r) => sum + r.available, 0);
    const stockValue = rows.reduce((sum, r) => sum + r.available * r.costPrice, 0);
    const lowStock = rows.filter((r) => statusOf(r) === "low").length;
    const outOfStock = rows.filter((r) => statusOf(r) === "out").length;
    const damagedStock = variants.reduce((sum, v) => sum + (v.damagedStock ?? 0), 0);
    const reservedStock = variants.reduce((sum, v) => sum + (v.reservedStock ?? 0), 0);
    return { totalUnits, stockValue, lowStock, outOfStock, damagedStock, reservedStock };
  }, [rows, variants]);

  const openAdjust = (row: StockRow) => setAdjusting(row);

  const submitAdjust = async (row: StockRow, stock: number, reason: string) => {
    const balanceBefore = row.available;
    await dispatch(
      adjustProductStock({ id: row.productId, input: { reason: "count", note: reason, adjustments: [{ variantId: row.variantId, set: stock }] } }),
    ).unwrap();
    dispatch(
      addMovement({
        productId: row.productId,
        barcode: row.barcode,
        date: new Date().toISOString().slice(0, 10),
        type: "Stock Adjustment",
        reference: `ADJ-${Date.now().toString(36).toUpperCase()}`,
        quantity: stock - balanceBefore,
        balanceBefore,
        balanceAfter: stock,
        performedBy: authUser?.name ?? "System",
        reason,
      }),
    );
  };

  const toDetailRow = (row: StockRow): StockDetailRow => {
    const variant = productById.get(row.productId)?.variants.find((v) => v.id === row.variantId);
    return {
      name: row.name,
      barcode: row.barcode,
      category: categoryById.get(row.categoryId)?.name ?? "—",
      brand: (row.brandId && brandById.get(row.brandId)?.name) || "—",
      supplier: (row.supplierId && supplierById.get(row.supplierId)?.name) ?? "—",
      size: row.size,
      color: row.color,
      available: row.available,
      minStock: row.minStock,
      damaged: variant?.damagedStock ?? 0,
      reserved: variant?.reservedStock ?? 0,
      price: row.price,
    };
  };

  const adjustTarget: AdjustStockTarget | undefined = adjusting
    ? { label: `${adjusting.name} · ${adjusting.color} · ${adjusting.size}`, barcode: adjusting.barcode, available: adjusting.available }
    : undefined;

  return (
    <div>
      <PageHeader
        title="Stock Overview"
        subtitle="Current stock for every colour and size."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Products" value={String(products.length)} icon={<HiOutlineCube className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Total Units" value={kpis.totalUnits.toLocaleString("en-IN")} icon={<HiOutlineSquares2X2 className="h-5 w-5" />} tone="sky" />
        <StatTile label="Stock Value" value={formatCurrency(kpis.stockValue)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="emerald" />
        <StatTile label="Low Stock" value={String(kpis.lowStock)} icon={<HiOutlineExclamationTriangle className="h-5 w-5" />} tone="rose" />
        <StatTile label="Out of Stock" value={String(kpis.outOfStock)} icon={<HiOutlineXCircle className="h-5 w-5" />} tone="rose" />
        <StatTile label="Damaged Stock" value={String(kpis.damagedStock)} icon={<HiOutlineWrenchScrewdriver className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Reserved Stock" value={String(kpis.reservedStock)} icon={<HiOutlineLockClosed className="h-5 w-5" />} tone="sky" />
      </div>

      <Card className="mb-6 mt-6 grid grid-cols-2 gap-3 p-4 md:grid-cols-3 xl:grid-cols-4">
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="">All sizes</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select value={color} onChange={(e) => setColor(e.target.value)}>
          <option value="">All colours</option>
          {colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All stock statuses</option>
          <option value="in-stock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </Select>
        <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
          <option value="">All suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <div className="col-span-2 flex items-center gap-2 md:col-span-1">
          <Input type="number" min="0" placeholder="Min ₹" aria-label="Minimum price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <span className="text-sm text-ink-muted">–</span>
          <Input type="number" min="0" placeholder="Max ₹" aria-label="Maximum price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <SearchInput
          placeholder="Search product or barcode…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search stock"
          className="col-span-2 sm:w-full lg:w-full md:col-span-1"
        />
      </Card>

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th>Colour</Th>
            <Th>Size</Th>
            <Th>Barcode</Th>
            <Th>Available</Th>
            <Th>Min Stock</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={9} message="No stock lines match your filters." />}
          {filtered.map((row) => {
            const rowStatus = statusOf(row);
            const meta = STATUS_META[rowStatus];
            return (
              <TableRow key={row.key}>
                <Td className="font-medium text-ink">{row.name}</Td>
                <Td>{categoryById.get(row.categoryId)?.name ?? "—"}</Td>
                <Td>{row.color}</Td>
                <Td>{row.size}</Td>
                <Td className="font-mono text-xs text-ink-muted">{row.barcode}</Td>
                <Td>{row.tracked ? row.available : <span className="text-ink-muted">Not tracked</span>}</Td>
                <Td>{row.minStock}</Td>
                <Td>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <IconButton label={`View ${row.name}`} onClick={() => setViewRow(row)}>
                      <HiOutlineEye className="h-4 w-4" />
                    </IconButton>
                    <IconButton label={`Edit ${row.name}`} onClick={() => router.push(`/inventory/products?edit=${encodeURIComponent(row.productId)}`)}>
                      <HiOutlinePencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton label={`Adjust stock for ${row.name}`} onClick={() => openAdjust(row)}>
                      <HiOutlineArrowPathRoundedSquare className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label={`View stock history for ${row.name}`}
                      onClick={() => router.push(`/inventory/stock-movement?productId=${encodeURIComponent(row.productId)}`)}
                    >
                      <HiOutlineClock className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label={`Print barcode for ${row.name}`}
                      onClick={() => router.push(`/inventory/barcode-labels?barcode=${encodeURIComponent(row.barcode)}`)}
                    >
                      <HiOutlinePrinter className="h-4 w-4" />
                    </IconButton>
                  </div>
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <StockDetailModal open={!!viewRow} row={viewRow ? toDetailRow(viewRow) : undefined} onClose={() => setViewRow(undefined)} />
      <AdjustStockModal
        open={!!adjusting}
        target={adjustTarget}
        onClose={() => setAdjusting(undefined)}
        onSubmit={async (stock, reason) => {
          if (adjusting) await submitAdjust(adjusting, stock, reason);
        }}
      />
    </div>
  );
}
