import type { Metadata } from "next";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  HiOutlineCube,
  HiOutlineFolder,
  HiOutlineTag,
  HiOutlineQueueList,
  HiOutlineArrowPath,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineQrCode,
  HiOutlineArrowsRightLeft,
  HiOutlineDocumentChartBar,
  HiChevronRight,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";

export const metadata: Metadata = {
  title: "Inventory Dashboard — Supplier Management",
};

interface InventoryLink {
  label: string;
  href: string;
  description: string;
  icon: IconType;
}

const INVENTORY_LINKS: InventoryLink[] = [
  { label: "Products", href: "/inventory/products", description: "Manage your product catalog.", icon: HiOutlineCube },
  { label: "Categories", href: "/inventory/categories", description: "Organize products into categories.", icon: HiOutlineFolder },
  { label: "Brands", href: "/inventory/brands", description: "Manage product brands.", icon: HiOutlineTag },
  { label: "Stock Overview", href: "/inventory/stock-overview", description: "Current stock levels across locations.", icon: HiOutlineQueueList },
  { label: "Stock Movement", href: "/inventory/stock-movement", description: "History of stock ins and outs.", icon: HiOutlineArrowPath },
  { label: "Stock Adjustment", href: "/inventory/stock-adjustment", description: "Correct stock counts and discrepancies.", icon: HiOutlineArrowPathRoundedSquare },
  { label: "Low Stock", href: "/inventory/low-stock", description: "Items nearing their reorder point.", icon: HiOutlineExclamationTriangle },
  { label: "Out of Stock", href: "/inventory/out-of-stock", description: "Items with zero stock on hand.", icon: HiOutlineXCircle },
  { label: "Barcode / Labels", href: "/inventory/barcode-labels", description: "Generate and print barcode labels.", icon: HiOutlineQrCode },
  { label: "Stock Transfer", href: "/inventory/stock-transfer", description: "Move stock between locations.", icon: HiOutlineArrowsRightLeft },
  { label: "Inventory Reports", href: "/inventory/reports", description: "Valuation, movement, and stock reports.", icon: HiOutlineDocumentChartBar },
];

export default function InventoryDashboardPage() {
  return (
    <div>
      <PageHeader title="Inventory Dashboard" subtitle="Products, stock levels, and inventory operations at a glance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {INVENTORY_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="flex items-start gap-3.5 p-5 transition-colors hover:bg-white/60">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne-100 text-champagne-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-ink">{item.label}</h2>
                    <HiChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{item.description}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
