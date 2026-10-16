"use client";

import { useEffect, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { mfaApi } from "@/features/auth/api";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Spinner } from "@/components/atoms/Spinner";
import { MfaCodeForm } from "./MfaCodeForm";
import type { AuthUser, MfaQrSetup as QrSetup } from "@/types/auth";

export function MfaQrSetup({ onComplete }: { onComplete: (user: AuthUser) => void }) {
  const [setup, setSetup] = useState<QrSetup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mfaApi
      .setupInit()
      .then(setSetup)
      .catch((err: Error) => setError(err.message));
  }, []);

  const copySecret = async () => {
    if (!setup) return;
    await navigator.clipboard.writeText(setup.secret).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) return <FormAlert variant="error">{error}</FormAlert>;
  if (!setup) {
    return (
      <div className="flex justify-center py-12 text-champagne-600">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-glass-border bg-white/70 p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={setup.qrCode} alt="QR code for Google Authenticator" width={208} height={208} className="h-52 w-52 rounded-lg" />
        <div className="flex w-full flex-col items-center gap-1.5 text-center">
          <span className="text-sm text-ink-muted">Can&apos;t scan? Enter this key in the app instead:</span>
          <button
            type="button"
            onClick={copySecret}
            className="inline-flex max-w-full items-center gap-2 rounded-lg px-2 py-1 font-mono text-sm font-semibold break-all text-ink hover:bg-champagne-50"
          >
            {setup.secret.match(/.{1,4}/g)?.join(" ")}
            {copied ? <FiCheck className="shrink-0 text-champagne-600" /> : <FiCopy className="shrink-0 text-ink-muted" />}
          </button>
        </div>
      </div>

      <MfaCodeForm
        id="mfa-setup-code"
        label="6-digit code from Google Authenticator"
        submitLabel="Verify and finish setup"
        onSubmit={async (values) => onComplete((await mfaApi.setupConfirm(values)).user)}
      />
    </div>
  );
}
