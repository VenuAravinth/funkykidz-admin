import type { ReactNode } from "react";

export interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, eyebrow, children, footer }: AuthCardProps) {
  return (
    <div
      className={[
        "w-full max-w-lg rounded-3xl border border-glass-border bg-glass p-6 backdrop-blur-xl sm:p-10 lg:max-w-xl lg:p-12",
        "shadow-[0_20px_60px_-15px_rgba(203,161,91,0.35),0_2px_10px_-2px_rgba(43,36,29,0.08)]",
      ].join(" ")}
    >
      <div className="mb-8 flex flex-col gap-2">
        {eyebrow}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-base leading-relaxed text-ink-muted">{subtitle}</p>}
      </div>
      {children}
      {footer && <div className="mt-8 text-center text-[15px] text-ink-muted sm:text-base">{footer}</div>}
    </div>
  );
}
