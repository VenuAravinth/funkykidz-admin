"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineArrowRightOnRectangle, HiOutlineBars3 } from "react-icons/hi2";
import { IconButton } from "@/components/atoms/IconButton";
import { Breadcrumb } from "@/components/molecules/Breadcrumb";
import { NavSearch } from "@/components/molecules/NavSearch";
import { NotificationCenter } from "@/components/organisms/NotificationCenter";
import { logoutUser } from "@/features/auth/api";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectAuthUser } from "@/stores/slices/authSlice";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const name = user?.name ?? "Admin";

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const signOut = async () => {
    setMenuOpen(false);
    await dispatch(logoutUser());
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-glass-border bg-cream-50/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <IconButton label="Open menu" onClick={onMenuClick} className="-ml-1 lg:hidden">
          <HiOutlineBars3 className="h-6 w-6" />
        </IconButton>

        <Breadcrumb />

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <NavSearch className="hidden w-64 md:block xl:w-80" />
          <NotificationCenter />

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-white/60 sm:pr-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-champagne-500 to-champagne-600 text-sm font-semibold text-white">
                {initials(name)}
              </span>
              <span className="hidden max-w-[10rem] truncate text-sm font-medium text-ink sm:block">{name}</span>
            </button>

            {menuOpen && (
              <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-glass-border bg-cream-50 p-1.5 shadow-2xl">
                <div className="border-b border-glass-border px-3 pb-2.5 pt-1.5">
                  <div className="truncate text-sm font-medium text-ink">{name}</div>
                  {user?.email && <div className="truncate text-xs text-ink-muted">{user.email}</div>}
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={signOut}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-ink hover:bg-white/70"
                >
                  <HiOutlineArrowRightOnRectangle className="h-5 w-5 text-ink-muted" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 sm:px-6 md:hidden">
        <NavSearch />
      </div>
    </header>
  );
}
