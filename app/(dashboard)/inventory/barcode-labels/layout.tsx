"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";

const TABS = [
  { label: "Generate Barcode", href: "/inventory/barcode-labels" },
  { label: "Print Labels", href: "/inventory/barcode-labels/print" },
  { label: "Scan Product", href: "/inventory/barcode-labels/scan" },
  { label: "Barcode History", href: "/inventory/barcode-labels/history" },
  { label: "Barcode Settings", href: "/inventory/barcode-labels/settings" },
];

export default function BarcodeLabelsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <PageHeader
        title="Barcode / Labels"
        subtitle="Everything related to product identification."
        backHref="/inventory"
        backLabel="Inventory"
      />
      <div className="no-print mb-6">
        <SegmentedTabs tabs={TABS.map((tab) => ({ ...tab, active: pathname === tab.href }))} />
      </div>
      {children}
    </div>
  );
}
