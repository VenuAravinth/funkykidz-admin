import type { Metadata } from "next";
import type { IconType } from "react-icons";
import Link from "next/link";
import {
  HiOutlineCurrencyRupee,
  HiOutlineTruck,
  HiOutlineArchiveBox,
  HiOutlineBuildingStorefront,
  HiOutlineUserGroup,
  HiOutlineBanknotes,
  HiOutlinePresentationChartBar,
  HiOutlineReceiptPercent,
  HiOutlineDocumentText,
  HiOutlineCreditCard,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";

export const metadata: Metadata = {
  title: "Reports — Funky Kids ERP",
};

interface ReportCategory {
  title: string;
  description: string;
  href: string;
  icon: IconType;
}

const CATEGORIES: ReportCategory[] = [
  { title: "Sales Reports", description: "How much did we sell, what sold, who bought it, and how profitable was it.", href: "/sales/reports", icon: HiOutlineCurrencyRupee },
  { title: "Purchase Reports", description: "How much stock did we buy and from whom.", href: "/reports/purchase", icon: HiOutlineTruck },
  { title: "Inventory Reports", description: "What stock do we have and what is happening to it.", href: "/inventory/reports", icon: HiOutlineArchiveBox },
  { title: "Supplier Reports", description: "Which suppliers are good, how much do we buy from them, and whom do we owe.", href: "/reports/suppliers", icon: HiOutlineBuildingStorefront },
  { title: "Customer Reports", description: "Who our best customers are and how much they buy.", href: "/reports/customers", icon: HiOutlineUserGroup },
  { title: "Expense Reports", description: "Where the business is spending money.", href: "/reports/expenses", icon: HiOutlineBanknotes },
  { title: "Profit & Loss", description: "Revenue, cost of goods, expenses, and net profit for the period.", href: "/finance/profit-loss", icon: HiOutlinePresentationChartBar },
  { title: "GST Reports", description: "Taxable sales, CGST/SGST/IGST, and GST collected vs. paid.", href: "/reports/gst", icon: HiOutlineReceiptPercent },
  { title: "Tax Reports", description: "Tax collected, tax paid, and a rate-wise breakdown across the business.", href: "/reports/tax", icon: HiOutlineDocumentText },
  { title: "Payment Reports", description: "How much money was actually collected and through which method.", href: "/reports/payments", icon: HiOutlineCreditCard },
];

export default function ReportsHubPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="The analytics center — pick a category to dig into." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href}>
              <Card className="group flex h-full flex-col gap-4 p-5 transition-shadow hover:shadow-[0_12px_36px_-14px_rgba(43,36,29,0.25)]">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-champagne-100 text-champagne-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <HiOutlineArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-champagne-700" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-ink">{c.title}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{c.description}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
