"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/atoms/Select";
import type { PurchaseOrder } from "@/types/supplier";

export function POSelectRedirect({ orders, selectedId }: { orders: PurchaseOrder[]; selectedId?: string }) {
  const router = useRouter();

  return (
    <Select
      value={selectedId ?? ""}
      onChange={(e) => {
        const value = e.target.value;
        router.push(value ? `/goods-received/new?poId=${value}` : "/goods-received/new");
      }}
    >
      <option value="">Select a purchase order…</option>
      {orders.map((po) => (
        <option key={po.id} value={po.id}>
          {po.poNumber} — {po.supplierName}
        </option>
      ))}
    </Select>
  );
}
