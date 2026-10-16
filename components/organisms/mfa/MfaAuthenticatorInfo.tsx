import type { ReactNode } from "react";
import { FaAppStoreIos, FaChrome, FaGooglePlay } from "react-icons/fa";
import { Button } from "@/components/atoms/Button";

const DOWNLOADS = [
  {
    href: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2",
    icon: <FaGooglePlay size={20} />,
    title: "Android",
    caption: "Google Play Store",
  },
  {
    href: "https://apps.apple.com/app/google-authenticator/id388497605",
    icon: <FaAppStoreIos size={22} />,
    title: "iPhone / iPad",
    caption: "Apple App Store",
  },
  {
    href: "https://authenticator.cc/",
    icon: <FaChrome size={20} />,
    title: "Browser extension",
    caption: "Chrome, Edge or Firefox",
  },
];

const STEPS: ReactNode[] = [
  "Install Google Authenticator on your phone (or a compatible authenticator extension in your browser).",
  <>Open the app and tap <strong className="font-semibold text-ink">+</strong>, then choose <strong className="font-semibold text-ink">Scan a QR code</strong>.</>,
  "On the next screen, scan the QR code and enter the 6-digit code the app shows.",
];

export function MfaAuthenticatorInfo({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {DOWNLOADS.map(({ href, icon, title, caption }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-glass-border bg-white/60 px-4 py-3 text-ink transition-colors hover:border-champagne-300 hover:bg-white/90 sm:flex-col sm:items-start sm:gap-2"
          >
            <span className="text-champagne-600">{icon}</span>
            <span className="flex flex-col">
              <span className="text-[15px] font-semibold">{title}</span>
              <span className="text-sm text-ink-muted">{caption}</span>
            </span>
          </a>
        ))}
      </div>

      <ol className="flex flex-col gap-3">
        {STEPS.map((step, index) => (
          <li key={index} className="flex gap-3 text-[15px] leading-relaxed text-ink-muted sm:text-base">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-champagne-100 text-sm font-semibold text-champagne-700">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <Button type="button" size="lg" fullWidth onClick={onContinue}>
        I&apos;ve installed the app
      </Button>
    </div>
  );
}
