"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Badge } from "@/components/atoms/Badge";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatDate } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectProducts } from "@/stores/slices/catalogSlice";
import { selectStockMovements } from "@/stores/slices/stockMovementsSlice";
import { movementTypes } from "@/types/stock";

function formatQty(qty: number): string {
  return qty > 0 ? `+${qty}` : String(qty);
}

function StockMovementContent() {
  const searchParams = useSearchParams();
  const movements = useAppSelector(selectStockMovements);
  const products = useAppSelector(selectProducts);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [productId, setProductId] = useState(searchParams.get("productId") ?? "");
  const [query, setQuery] = useState(searchParams.get("barcode") ?? "");
  const [type, setType] = useState("");
  const [user, setUser] = useState("");

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const users = useMemo(() => Array.from(new Set(movements.map((m) => m.performedBy))).sort(), [movements]);

  const filtered = useMemo(() => {
    return movements
      .filter((m) => {
        const matchesFrom = !dateFrom || m.date >= dateFrom;
        const matchesTo = !dateTo || m.date <= dateTo;
        const matchesProduct = !productId || m.productId === productId;
        const q = query.trim().toLowerCase();
        const matchesQuery = !q || m.barcode.toLowerCase().includes(q) || m.reference.toLowerCase().includes(q);
        const matchesType = !type || m.type === type;
        const matchesUser = !user || m.performedBy === user;
        return matchesFrom && matchesTo && matchesProduct && matchesQuery && matchesType && matchesUser;
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id.localeCompare(a.id)));
  }, [movements, dateFrom, dateTo, productId, query, type, user]);

  return (
    <div>
      <PageHeader
        title="Stock Movement"
        subtitle="Every stock change, with who, when, why, and the running balance."
        backHref="/inventory"
        backLabel="Inventory"
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="min-w-0 flex-1 sm:w-40 sm:flex-none" aria-label="From date" />
          <span className="text-sm text-ink-muted">–</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="min-w-0 flex-1 sm:w-40 sm:flex-none" aria-label="To date" />
        </div>
        <Select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-auto">
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-auto">
          <option value="">All movement types</option>
          {movementTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select value={user} onChange={(e) => setUser(e.target.value)} className="w-auto">
          <option value="">All users</option>
          {users.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Select>
        <SearchInput
          placeholder="Search barcode or reference…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search stock movements"
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <Th>Date</Th>
            <Th>Product</Th>
            <Th>Barcode</Th>
            <Th>Type</Th>
            <Th>Reference</Th>
            <Th>Qty</Th>
            <Th>Before</Th>
            <Th>Balance</Th>
            <Th>By</Th>
            <Th>Reason</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && <TableEmpty colSpan={10} message="No stock movements match your filters." />}
          {filtered.map((m) => (
            <TableRow key={m.id}>
              <Td className="text-ink-muted">{formatDate(m.date)}</Td>
              <Td className="font-medium text-ink">{productById.get(m.productId)?.name ?? "—"}</Td>
              <Td className="text-ink-muted">{m.barcode}</Td>
              <Td>
                <Badge tone={m.quantity > 0 ? "success" : m.quantity < 0 ? "danger" : "neutral"}>{m.type}</Badge>
              </Td>
              <Td>{m.reference}</Td>
              <Td className={m.quantity > 0 ? "font-medium text-emerald-600" : "font-medium text-red-600"}>{formatQty(m.quantity)}</Td>
              <Td>{m.balanceBefore}</Td>
              <Td className="font-medium text-ink">{m.balanceAfter}</Td>
              <Td>{m.performedBy}</Td>
              <Td className="max-w-xs !whitespace-normal text-ink-muted">{m.reason}</Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function StockMovementPage() {
  return (
    <Suspense fallback={null}>
      <StockMovementContent />
    </Suspense>
  );
}
