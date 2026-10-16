"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/atoms/Select";
import type { Supplier } from "@/types/supplier";

export function SupplierSelectRedirect({
  suppliers,
  selectedId,
  basePath = "/reports/suppliers",
}: {
  suppliers: Supplier[];
  selectedId?: string;
  basePath?: string;
}) {
  const router = useRouter();

  return (
    <Select
      value={selectedId ?? ""}
      onChange={(e) => router.push(`${basePath}?type=ledger&supplierId=${e.target.value}`)}
    >
      {suppliers.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} ({s.code})
        </option>
      ))}
    </Select>
  );
}
