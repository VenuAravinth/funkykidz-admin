"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  HiOutlineBanknotes,
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineLockClosed,
  HiOutlineSquares2X2,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { StatTile } from "@/components/molecules/StatTile";
import { Card } from "@/components/atoms/Card";
import { Select } from "@/components/atoms/Select";
import { Badge, type BadgeTone } from "@/components/atoms/Badge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { FastMovingChart } from "@/components/organisms/charts/FastMovingChart";
import { CategoryValueChart } from "@/components/organisms/charts/CategoryValueChart";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectCategories, selectProducts } from "@/stores/slices/catalogSlice";
import { selectStockMovements } from "@/stores/slices/stockMovementsSlice";
import type { Category, Product } from "@/types/product";
import type { MovementType, StockMovement } from "@/types/stock";

type ReportType = "summary" | "valuation" | "movement" | "fast-moving" | "slow-moving" | "profit" | "category";

const TABS: { label: string; type: ReportType }[] = [
  { label: "Stock Summary", type: "summary" },
  { label: "Stock Valuation", type: "valuation" },
  { label: "Stock Movement", type: "movement" },
  { label: "Fast Moving", type: "fast-moving" },
  { label: "Slow Moving", type: "slow-moving" },
  { label: "Profit / Margin", type: "profit" },
  { label: "Category Report", type: "category" },
];

const MOVEMENT_BUCKETS: { label: string; types: MovementType[] }[] = [
  { label: "Purchases", types: ["Purchase"] },
  { label: "Sales", types: ["Sale"] },
  { label: "Returns", types: ["Sales Return", "Purchase Return"] },
  { label: "Adjustments", types: ["Stock Adjustment"] },
  { label: "Transfers", types: ["Transfer In", "Transfer Out"] },
  { label: "Damages", types: ["Damage", "Lost"] },
];

function unitsSoldByProduct(movements: StockMovement[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const m of movements) {
    if (m.type !== "Sale") continue;
    map.set(m.productId, (map.get(m.productId) ?? 0) + Math.abs(m.quantity));
  }
  return map;
}

function lastSaleDateByProduct(movements: StockMovement[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of movements) {
    if (m.type !== "Sale") continue;
    const existing = map.get(m.productId);
    if (!existing || m.date > existing) map.set(m.productId, m.date);
  }
  return map;
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000);
}

function StockSummarySection({ products }: { products: Product[] }) {
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const variantTotal = (key: "reservedStock" | "damagedStock") =>
    products.reduce((sum, p) => sum + p.variants.reduce((n, v) => n + (v[key] ?? 0), 0), 0);
  const reserved = variantTotal("reservedStock");
  const damaged = variantTotal("damagedStock");
  const available = totalUnits - reserved - damaged;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatTile label="Total Products" value={String(products.length)} icon={<HiOutlineCube className="h-5 w-5" />} tone="champagne" />
      <StatTile label="Total Units" value={totalUnits.toLocaleString("en-IN")} icon={<HiOutlineSquares2X2 className="h-5 w-5" />} tone="sky" />
      <StatTile label="Total Stock Value" value={formatCurrency(totalValue)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="emerald" />
      <StatTile label="Available" value={available.toLocaleString("en-IN")} icon={<HiOutlineCheckCircle className="h-5 w-5" />} tone="champagne" />
      <StatTile label="Reserved" value={reserved.toLocaleString("en-IN")} icon={<HiOutlineLockClosed className="h-5 w-5" />} tone="sky" />
      <StatTile label="Damaged" value={damaged.toLocaleString("en-IN")} icon={<HiOutlineWrenchScrewdriver className="h-5 w-5" />} tone="rose" />
    </div>
  );
}

function StockValuationSection({ products }: { products: Product[] }) {
  const rows = products.map((product) => {
    const stockValue = product.stock * product.costPrice;
    const potentialSales = product.stock * product.price;
    return { product, stockValue, potentialSales, potentialMargin: potentialSales - stockValue };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      quantity: acc.quantity + r.product.stock,
      stockValue: acc.stockValue + r.stockValue,
      potentialSales: acc.potentialSales + r.potentialSales,
      potentialMargin: acc.potentialMargin + r.potentialMargin,
    }),
    { quantity: 0, stockValue: 0, potentialSales: 0, potentialMargin: 0 },
  );

  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Product</Th>
          <Th>Quantity</Th>
          <Th>Purchase Price</Th>
          <Th>Stock Value</Th>
          <Th>Selling Price</Th>
          <Th>Potential Sales Value</Th>
          <Th>Potential Margin</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={7} message="No products to value." />}
        {rows.map(({ product, stockValue, potentialSales, potentialMargin }) => (
          <TableRow key={product.id}>
            <Td>
              <div className="font-medium text-ink">{product.name}</div>
              <div className="text-xs text-ink-muted">{product.category}</div>
            </Td>
            <Td>{product.stock}</Td>
            <Td>{formatCurrency(product.costPrice)}</Td>
            <Td>{formatCurrency(stockValue)}</Td>
            <Td>{formatCurrency(product.price)}</Td>
            <Td>{formatCurrency(potentialSales)}</Td>
            <Td className={potentialMargin >= 0 ? "font-medium text-emerald-600" : "font-medium text-red-600"}>
              {formatCurrency(potentialMargin)}
            </Td>
          </TableRow>
        ))}
      </TableBody>
      {rows.length > 0 && (
        <tfoot>
          <TableRow summary className="bg-white/60 font-semibold">
            <Td>Total</Td>
            <Td>{totals.quantity}</Td>
            <Td>—</Td>
            <Td>{formatCurrency(totals.stockValue)}</Td>
            <Td>—</Td>
            <Td>{formatCurrency(totals.potentialSales)}</Td>
            <Td>{formatCurrency(totals.potentialMargin)}</Td>
          </TableRow>
        </tfoot>
      )}
    </Table>
  );
}

function StockMovementSection({ movements }: { movements: StockMovement[] }) {
  const buckets = MOVEMENT_BUCKETS.map((bucket) => {
    const matched = movements.filter((m) => bucket.types.includes(m.type));
    const totalUnits = matched.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const netQuantity = matched.reduce((sum, m) => sum + m.quantity, 0);
    return { label: bucket.label, transactions: matched.length, totalUnits, netQuantity };
  });

  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Movement Type</Th>
          <Th>Transactions</Th>
          <Th>Total Units</Th>
          <Th>Net Quantity</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {buckets.map((b) => (
          <TableRow key={b.label}>
            <Td className="font-medium text-ink">{b.label}</Td>
            <Td>{b.transactions}</Td>
            <Td>{b.totalUnits}</Td>
            <Td className={b.netQuantity > 0 ? "text-emerald-600" : b.netQuantity < 0 ? "text-red-600" : "text-ink-muted"}>
              {b.netQuantity > 0 ? "+" : ""}
              {b.netQuantity}
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function FastMovingSection({ products, movements }: { products: Product[]; movements: StockMovement[] }) {
  const rows = useMemo(() => {
    const sold = unitsSoldByProduct(movements);
    return products
      .map((product) => ({ product, unitsSold: sold.get(product.id) ?? 0 }))
      .filter((r) => r.unitsSold > 0)
      .map((r) => ({ ...r, revenue: r.unitsSold * r.product.price }))
      .sort((a, b) => b.unitsSold - a.unitsSold);
  }, [products, movements]);

  return (
    <div className="flex flex-col gap-6">
      {rows.length > 0 && (
        <Card className="p-6">
          <FastMovingChart data={rows.map((r) => ({ name: r.product.name, unitsSold: r.unitsSold }))} />
        </Card>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <Th>Product</Th>
            <Th>Units Sold</Th>
            <Th>Revenue</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={3} message="No sales recorded yet." />}
          {rows.map(({ product, unitsSold, revenue }) => (
            <TableRow key={product.id}>
              <Td className="font-medium text-ink">{product.name}</Td>
              <Td>{unitsSold}</Td>
              <Td>{formatCurrency(revenue)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function severityTone(days: number): BadgeTone {
  if (!Number.isFinite(days) || days >= 180) return "danger";
  if (days >= 90) return "warning";
  return "neutral";
}

function SlowMovingSection({
  products,
  movements,
  categories,
}: {
  products: Product[];
  movements: StockMovement[];
  categories: Category[];
}) {
  const [threshold, setThreshold] = useState(30);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const rows = useMemo(() => {
    const lastSale = lastSaleDateByProduct(movements);
    const today = new Date().toISOString().slice(0, 10);
    return products
      .map((product) => {
        const lastSaleDate = lastSale.get(product.id);
        const days = lastSaleDate ? daysBetween(lastSaleDate, today) : Infinity;
        return { product, lastSaleDate, days };
      })
      .filter((r) => r.days >= threshold)
      .sort((a, b) => b.days - a.days);
  }, [products, movements, threshold]);

  return (
    <div>
      <p className="mb-4 text-sm text-ink-muted">
        Seasonal and fashion stock can turn into dead stock fast — this surfaces products sitting still the longest.
      </p>
      <div className="mb-5 flex items-center gap-3">
        <span className="text-sm text-ink-muted">Not sold in the last</span>
        <Select value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-auto">
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
          <option value={90}>90 days</option>
          <option value={180}>180+ days</option>
        </Select>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th>Current Stock</Th>
            <Th>Last Sale</Th>
            <Th>Days Since Last Sale</Th>
            <Th>Stock Value</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={6} message={`Nothing has gone unsold for ${threshold}+ days.`} />}
          {rows.map(({ product, lastSaleDate, days }) => (
            <TableRow key={product.id}>
              <Td className="font-medium text-ink">{product.name}</Td>
              <Td>{categoryById.get(product.categoryId)?.name ?? "—"}</Td>
              <Td>{product.stock}</Td>
              <Td>{lastSaleDate ? formatDate(lastSaleDate) : "—"}</Td>
              <Td>
                <Badge tone={severityTone(days)}>{Number.isFinite(days) ? `${days}d` : "Never sold"}</Badge>
              </Td>
              <Td>{formatCurrency(product.stock * product.costPrice)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProfitMarginSection({ products, movements }: { products: Product[]; movements: StockMovement[] }) {
  const rows = useMemo(() => {
    const sold = unitsSoldByProduct(movements);
    return products
      .map((product) => {
        const unitsSold = sold.get(product.id) ?? 0;
        const cost = unitsSold * product.costPrice;
        const revenue = unitsSold * product.price;
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        return { product, cost, revenue, profit, margin };
      })
      .filter((r) => r.revenue > 0)
      .sort((a, b) => b.profit - a.profit);
  }, [products, movements]);

  const totals = rows.reduce(
    (acc, r) => ({ cost: acc.cost + r.cost, revenue: acc.revenue + r.revenue, profit: acc.profit + r.profit }),
    { cost: 0, revenue: 0, profit: 0 },
  );
  const totalMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <Th>Product</Th>
          <Th>Purchase Cost</Th>
          <Th>Selling Revenue</Th>
          <Th>Gross Profit</Th>
          <Th>Margin %</Th>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 && <TableEmpty colSpan={5} message="No sales recorded yet." />}
        {rows.map(({ product, cost, revenue, profit, margin }) => (
          <TableRow key={product.id}>
            <Td className="font-medium text-ink">{product.name}</Td>
            <Td>{formatCurrency(cost)}</Td>
            <Td>{formatCurrency(revenue)}</Td>
            <Td className={profit >= 0 ? "text-emerald-600" : "text-red-600"}>{formatCurrency(profit)}</Td>
            <Td>{margin.toFixed(1)}%</Td>
          </TableRow>
        ))}
      </TableBody>
      {rows.length > 0 && (
        <tfoot>
          <TableRow summary className="bg-white/60 font-semibold">
            <Td>Total</Td>
            <Td>{formatCurrency(totals.cost)}</Td>
            <Td>{formatCurrency(totals.revenue)}</Td>
            <Td>{formatCurrency(totals.profit)}</Td>
            <Td>{totalMargin.toFixed(1)}%</Td>
          </TableRow>
        </tfoot>
      )}
    </Table>
  );
}

function CategoryReportSection({
  products,
  categories,
  movements,
}: {
  products: Product[];
  categories: Category[];
  movements: StockMovement[];
}) {
  const rows = useMemo(() => {
    const sold = unitsSoldByProduct(movements);
    return categories.map((category) => {
      const catProducts = products.filter((p) => p.categoryId === category.id);
      const quantity = catProducts.reduce((sum, p) => sum + p.stock, 0);
      const stockValue = catProducts.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
      const sales = catProducts.reduce((sum, p) => sum + (sold.get(p.id) ?? 0) * p.price, 0);
      const profit = catProducts.reduce((sum, p) => sum + (sold.get(p.id) ?? 0) * (p.price - p.costPrice), 0);
      return { category, quantity, stockValue, sales, profit };
    });
  }, [products, categories, movements]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <CategoryValueChart data={rows.map((r) => ({ name: r.category.name, stockValue: r.stockValue, profit: r.profit }))} />
      </Card>
      <Table>
        <TableHead>
          <TableRow>
            <Th>Category</Th>
            <Th>Quantity</Th>
            <Th>Sales</Th>
            <Th>Stock Value</Th>
            <Th>Profit</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={5} message="No categories found." />}
          {rows.map(({ category, quantity, sales, stockValue, profit }) => (
            <TableRow key={category.id}>
              <Td className="font-medium text-ink">{category.name}</Td>
              <Td>{quantity}</Td>
              <Td>{formatCurrency(sales)}</Td>
              <Td>{formatCurrency(stockValue)}</Td>
              <Td className={profit >= 0 ? "text-emerald-600" : "text-red-600"}>{formatCurrency(profit)}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InventoryReportsContent() {
  const searchParams = useSearchParams();
  const activeType = (searchParams.get("type") as ReportType | null) ?? "summary";

  const products = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategories);
  const movements = useAppSelector(selectStockMovements);

  const tabs = TABS.map((t) => ({ label: t.label, href: `/inventory/reports?type=${t.type}`, active: activeType === t.type }));

  return (
    <div>
      <PageHeader
        title="Inventory Reports"
        subtitle="Your analysis section — valuation, movement, and profitability, not another operational stock screen."
        backHref="/inventory"
        backLabel="Inventory"
      />

      <div className="mb-6">
        <SegmentedTabs tabs={tabs} />
      </div>

      {activeType === "summary" && <StockSummarySection products={products} />}
      {activeType === "valuation" && <StockValuationSection products={products} />}
      {activeType === "movement" && <StockMovementSection movements={movements} />}
      {activeType === "fast-moving" && <FastMovingSection products={products} movements={movements} />}
      {activeType === "slow-moving" && <SlowMovingSection products={products} movements={movements} categories={categories} />}
      {activeType === "profit" && <ProfitMarginSection products={products} movements={movements} />}
      {activeType === "category" && <CategoryReportSection products={products} categories={categories} movements={movements} />}
    </div>
  );
}

export default function InventoryReportsPage() {
  return (
    <Suspense fallback={null}>
      <InventoryReportsContent />
    </Suspense>
  );
}
