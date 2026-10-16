"use client";

import { Modal } from "@/components/molecules/Modal";
import { formatCurrency } from "@/lib/format";

export interface StockDetailRow {
  name: string;
  barcode: string;
  category: string;
  brand: string;
  supplier: string;
  size: string;
  color: string;
  available: number;
  minStock: number;
  damaged: number;
  reserved: number;
  price: number;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

export function StockDetailModal({ open, row, onClose }: { open: boolean; row?: StockDetailRow; onClose: () => void }) {
  if (!row) return null;

  return (
    <Modal size="lg" open={open} onClose={onClose} title={row.name} subtitle={row.barcode}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <DetailItem label="Category" value={row.category} />
        <DetailItem label="Brand" value={row.brand} />
        <DetailItem label="Supplier" value={row.supplier} />
        <DetailItem label="Size" value={row.size} />
        <DetailItem label="Color" value={row.color} />
        <DetailItem label="Price" value={formatCurrency(row.price)} />
        <DetailItem label="Available" value={String(row.available)} />
        <DetailItem label="Min Stock" value={String(row.minStock)} />
        <DetailItem label="Damaged" value={String(row.damaged)} />
        <DetailItem label="Reserved" value={String(row.reserved)} />
      </div>
    </Modal>
  );
}
