"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/stores/hooks";
import { selectIsAuthenticated, selectSessionChecked } from "@/stores/slices/authSlice";
import { Sidebar } from "@/components/organisms/Sidebar";
import { Topbar } from "@/components/organisms/Topbar";
import { BarcodeScanListener } from "@/components/organisms/BarcodeScanListener";

export interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = useCallback(() => setNavOpen(false), []);
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const sessionChecked = useAppSelector(selectSessionChecked);

  useEffect(() => {
    if (sessionChecked && !isAuthenticated) router.replace("/login");
  }, [sessionChecked, isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div
      style={{ colorScheme: "light" }}
      className="relative flex min-h-screen w-full bg-gradient-to-br from-cream-50 via-blush-50 to-champagne-100"
    >
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-champagne-300/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 right-1/3 h-96 w-96 rounded-full bg-blush-50/60 blur-3xl" />

      <Sidebar mobileOpen={navOpen} onMobileClose={closeNav} />
      <BarcodeScanListener />

      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setNavOpen(true)} />
        <main className="mx-auto w-full min-w-0 max-w-[1600px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
