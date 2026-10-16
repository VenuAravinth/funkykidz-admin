import type { ReactNode } from "react";
import Link from "next/link";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({ title, subtitle, actions, backHref, backLabel }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 sm:mb-8">
      <div className="min-w-0 max-w-full">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-champagne-700"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            {backLabel ?? "Back"}
          </Link>
        )}
        <h1 className="break-words text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem] sm:leading-9">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {actions && (
        <div
          className={[
            "flex min-w-0 flex-1 basis-full flex-wrap items-center gap-3 sm:basis-auto sm:justify-end",
            "max-sm:[&>a]:flex-1 max-sm:[&>a>button]:w-full max-sm:[&>button]:flex-1",
            "max-sm:[&>select]:flex-1 max-sm:[&>select]:basis-[calc(50%-0.375rem)] sm:[&>select]:w-auto",
          ].join(" ")}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
