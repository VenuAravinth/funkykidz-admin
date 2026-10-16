"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { cn } from "@/lib/cn";
import {
  HiOutlineBuildingOffice2,
  HiOutlineBuildingStorefront,
  HiOutlineDocumentText,
  HiOutlineReceiptPercent,
  HiOutlineCreditCard,
  HiOutlineQrCode,
  HiOutlineBellAlert,
  HiOutlinePrinter,
  HiOutlineCloudArrowUp,
  HiOutlineShieldCheck,
  HiOutlineMapPin,
} from "react-icons/hi2";

const SETTINGS_NAV = [
  { label: "Business Profile", href: "/settings/business-profile", icon: HiOutlineBuildingOffice2 },
  { label: "Store Settings", href: "/settings/store", icon: HiOutlineBuildingStorefront },
  { label: "Invoice Settings", href: "/settings/invoice", icon: HiOutlineDocumentText },
  { label: "Tax / GST", href: "/settings/tax-gst", icon: HiOutlineReceiptPercent },
  { label: "Payment Methods", href: "/settings/payment-methods", icon: HiOutlineCreditCard },
  { label: "Barcode Settings", href: "/settings/barcode", icon: HiOutlineQrCode },
  { label: "Notification Settings", href: "/settings/notifications", icon: HiOutlineBellAlert },
  { label: "Print Settings", href: "/settings/print", icon: HiOutlinePrinter },
  { label: "Backup / Restore", href: "/settings/backup-restore", icon: HiOutlineCloudArrowUp },
  { label: "Security Settings", href: "/settings/security", icon: HiOutlineShieldCheck },
  { label: "Locations & Registers", href: "/settings/locations", icon: HiOutlineMapPin },
] as const;

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure how Funky Kids ERP runs — billing, tax, inventory, and security."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="no-print h-fit p-2 lg:sticky lg:top-24">
          <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:overflow-visible">
            {SETTINGS_NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-champagne-500 text-white shadow-sm" : "text-ink-muted hover:bg-white/70 hover:text-ink",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Card>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
