"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HiOutlineArrowRight, HiOutlineMagnifyingGlass, HiOutlineTruck } from "react-icons/hi2";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Barcode } from "@/components/atoms/Barcode";
import { formatCurrency } from "@/lib/format";
import { getPurchaseOrdersBySupplier, getSupplierById } from "@/lib/dummy-data/suppliers";
import { buildStockRows } from "@/lib/stockRows";
import { useAppSelector } from "@/stores/hooks";
import { selectBrands, selectCategories, selectProducts } from "@/stores/slices/catalogSlice";

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

export default function ScanProductPage() {
  const products = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategories);
  const brands = useAppSelector(selectBrands);

  const [input, setInput] = useState("");
  const [lookedUp, setLookedUp] = useState<string | undefined>(undefined);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const brandById = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);

  const rows = useMemo(() => buildStockRows(products), [products]);
  const match = lookedUp ? rows.find((row) => row.barcode === lookedUp) : undefined;

  const supplier = match?.supplierId ? getSupplierById(match.supplierId) : undefined;
  const receivablePO = supplier
    ? getPurchaseOrdersBySupplier(supplier.id).find((po) => po.status === "pending" || po.status === "partial")
    : undefined;

  const lookup = () => setLookedUp(input.trim());

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="p-6">
        <h2 className="mb-1 text-sm font-semibold text-ink">Scan a barcode</h2>
        <p className="mb-5 text-xs text-ink-muted">
          Most barcode scanners act as a keyboard — this box works whether you type a barcode or scan with a handheld reader.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup();
          }}
          className="flex gap-3"
        >
          <Input
            autoFocus
            placeholder="Scan or type a barcode…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <HiOutlineMagnifyingGlass className="h-4 w-4" />
            Look up
          </Button>
        </form>

        {lookedUp && !match && (
          <p className="mt-5 text-sm text-ink-muted">No product found for &quot;{lookedUp}&quot;.</p>
        )}

        {match && (
          <div className="mt-6 flex flex-col gap-5">
            <div>
              <p className="text-lg font-semibold text-ink">{match.name}</p>
              <p className="text-sm text-ink-muted">
                {match.color} · {match.size}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <DetailItem label="Category" value={categoryById.get(match.categoryId)?.name ?? "—"} />
              <DetailItem label="Brand" value={(match.brandId && brandById.get(match.brandId)?.name) || "—"} />
              <DetailItem label="Supplier" value={supplier?.name ?? "—"} />
              <DetailItem label="Price" value={formatCurrency(match.price)} />
              <DetailItem label="Available" value={match.tracked ? String(match.available) : "Not tracked"} />
              <DetailItem label="Min Stock" value={String(match.minStock)} />
            </div>
            <Barcode value={match.barcode} height={40} width={1.6} displayValue />

            <div className="flex flex-wrap gap-3">
              <Link href={`/inventory/barcode-labels?barcode=${encodeURIComponent(match.barcode)}`}>
                <Button variant="secondary">
                  Generate Label
                  <HiOutlineArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {receivablePO && (
                <Link href={`/goods-received/new?poId=${receivablePO.id}`}>
                  <Button variant="secondary">
                    <HiOutlineTruck className="h-4 w-4" />
                    Receive against {receivablePO.poNumber}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <h2 className="text-sm font-semibold text-ink">How scanning fits into your workflow</h2>
        <div>
          <p className="text-sm font-semibold text-ink">Sales</p>
          <p className="text-sm text-ink-muted">Scan → Add to Cart → Sell → Stock -1</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Purchasing</p>
          <p className="text-sm text-ink-muted">Scan → Match PO → Receive → Stock +1</p>
        </div>
        <p className="text-xs text-ink-muted">
          This ERP doesn&apos;t have a point-of-sale module yet, so the Sales flow above is shown for reference only.
          The Purchasing flow is real — scan a product with a pending purchase order from its supplier and use
          &quot;Receive against&quot; to jump straight into Goods Received.
        </p>
      </Card>
    </div>
  );
}
