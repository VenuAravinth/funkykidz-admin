import type { ReactNode } from "react";
import { HiSparkles } from "react-icons/hi2";

export interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      style={{ colorScheme: "light" }}
      className="relative flex min-h-screen w-full overflow-hidden bg-gradient-to-br from-cream-50 via-blush-50 to-champagne-100"
    >
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-champagne-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-blush-50/70 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-1/4 h-72 w-72 rounded-full bg-champagne-500/20 blur-3xl" />

      <aside className="relative hidden w-1/2 flex-col justify-between p-14 lg:flex">
        <div className="flex items-center gap-2 text-ink">
          <HiSparkles className="h-6 w-6 text-champagne-600" />
          <span className="text-lg font-semibold tracking-tight">Funky Kids ERP</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-ink">
            Effortless procurement, beautifully organized.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Manage suppliers, purchase orders, and contracts in one refined workspace built for growing teams.
          </p>
        </div>

        <p className="text-sm text-ink-muted">&copy; {new Date().getFullYear()} Funky Kids. All rights reserved.</p>
      </aside>

      <main className="relative flex w-full flex-1 flex-col items-center justify-center gap-8 px-4 py-10 sm:p-10">
        <div className="flex items-center gap-2 text-ink lg:hidden">
          <HiSparkles className="h-5 w-5 text-champagne-600" />
          <span className="text-base font-semibold tracking-tight">Funky Kids ERP</span>
        </div>
        {children}
      </main>
    </div>
  );
}
