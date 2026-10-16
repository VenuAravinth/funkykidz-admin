"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mfaApi } from "@/features/auth/api";
import { useAppDispatch } from "@/stores/hooks";
import { authenticated } from "@/stores/slices/authSlice";
import { AuthCard } from "@/components/organisms/AuthCard";
import { LoginForm } from "@/components/organisms/LoginForm";
import { MfaCodeForm } from "@/components/organisms/mfa/MfaCodeForm";
import { MfaEmailForm } from "@/components/organisms/mfa/MfaEmailForm";
import { MfaAuthenticatorInfo } from "@/components/organisms/mfa/MfaAuthenticatorInfo";
import { MfaQrSetup } from "@/components/organisms/mfa/MfaQrSetup";
import type { AuthUser, LoginResponse } from "@/types/auth";

type Step = "credentials" | "setup-email" | "setup-otp" | "setup-app" | "setup-qr" | "verify" | "verify-email";

const SETUP_STEPS: Step[] = ["setup-email", "setup-otp", "setup-app", "setup-qr"];

const COPY: Record<Step, { title: string; subtitle: string }> = {
  credentials: { title: "Welcome back", subtitle: "Sign in to continue to your workspace." },
  "setup-email": {
    title: "Verify your email",
    subtitle: "Let's secure your account with two-factor authentication. First, confirm the email address on your account.",
  },
  "setup-otp": { title: "Enter the email code", subtitle: "Type the 6-digit code we just emailed you." },
  "setup-app": {
    title: "Get Google Authenticator",
    subtitle: "Install the free Google Authenticator app to generate sign-in codes.",
  },
  "setup-qr": { title: "Scan the QR code", subtitle: "Scan this code with Google Authenticator, then enter the 6-digit code it shows." },
  verify: { title: "Two-factor authentication", subtitle: "Enter the 6-digit code from your Google Authenticator app." },
  "verify-email": { title: "Check your email", subtitle: "Enter the 6-digit code we sent to your registered email address." },
};

export function LoginFlow({ notice }: { notice?: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const go = (next: Step, nextMessage: string | null = null) => {
    setMessage(nextMessage);
    setOtpError(null);
    setStep(next);
  };

  const finish = (user: AuthUser) => {
    dispatch(authenticated(user));
    router.push("/");
  };

  const onCredentials = (result: LoginResponse) => {
    if ("user" in result) return finish(result.user);
    setEmail(result.email);
    go(result.mfa === "setup" ? "setup-email" : "verify");
  };

  const sendLoginOtp = async () => {
    setSendingOtp(true);
    setOtpError(null);
    try {
      go("verify-email", (await mfaApi.loginSendOtp()).message);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Couldn't send the code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const setupIndex = SETUP_STEPS.indexOf(step);
  const linkClass = "font-medium text-champagne-600 hover:text-champagne-700 disabled:opacity-60";

  return (
    <AuthCard
      title={COPY[step].title}
      subtitle={COPY[step].subtitle}
      eyebrow={
        setupIndex >= 0 && (
          <div className="mb-2 flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-champagne-600">
              Step {setupIndex + 1} of {SETUP_STEPS.length}
            </span>
            <div className="grid grid-cols-4 gap-2" aria-hidden>
              {SETUP_STEPS.map((s, i) => (
                <span key={s} className={`h-1.5 rounded-full ${i <= setupIndex ? "bg-champagne-500" : "bg-champagne-100"}`} />
              ))}
            </div>
          </div>
        )
      }
      footer={
        step !== "credentials" && (
          <button type="button" className={linkClass} onClick={() => go("credentials")}>
            Back to sign in
          </button>
        )
      }
    >
      {step === "credentials" && <LoginForm onSuccess={onCredentials} notice={notice} />}

      {step === "setup-email" && <MfaEmailForm defaultEmail={email} onSent={(msg) => go("setup-otp", msg)} />}

      {step === "setup-otp" && (
        <MfaCodeForm
          id="mfa-setup-otp"
          label="Email verification code"
          submitLabel="Verify email"
          notice={message}
          onSubmit={async (values) => {
            await mfaApi.setupVerifyOtp(values);
            go("setup-app");
          }}
        >
          <p className="text-center text-[15px] text-ink-muted sm:text-base">
            Didn&apos;t get it?{" "}
            <button type="button" className={linkClass} onClick={() => go("setup-email")}>
              Send a new code
            </button>
          </p>
        </MfaCodeForm>
      )}

      {step === "setup-app" && <MfaAuthenticatorInfo onContinue={() => go("setup-qr")} />}

      {step === "setup-qr" && <MfaQrSetup onComplete={finish} />}

      {(step === "verify" || step === "verify-email") && (
        <MfaCodeForm
          key={step}
          id={step === "verify" ? "mfa-code" : "mfa-email-otp"}
          label={step === "verify" ? "Authentication code" : "Email verification code"}
          submitLabel="Verify and sign in"
          notice={otpError ? null : message}
          onSubmit={async (values) =>
            finish((step === "verify" ? await mfaApi.verify(values) : await mfaApi.loginVerifyOtp(values)).user)
          }
        >
          <div className="flex flex-col items-center gap-2 text-center text-[15px] text-ink-muted sm:text-base">
            {otpError && <p className="text-sm font-medium text-red-500">{otpError}</p>}
            {step === "verify" ? (
              <p>
                Don&apos;t have access to Google Authenticator?{" "}
                <button type="button" className={linkClass} disabled={sendingOtp} onClick={sendLoginOtp}>
                  {sendingOtp ? "Sending…" : "Send OTP to email"}
                </button>
              </p>
            ) : (
              <p>
                <button type="button" className={linkClass} disabled={sendingOtp} onClick={sendLoginOtp}>
                  {sendingOtp ? "Sending…" : "Resend code"}
                </button>
                <span className="mx-2">·</span>
                <button type="button" className={linkClass} onClick={() => go("verify")}>
                  Use authenticator app
                </button>
              </p>
            )}
          </div>
        </MfaCodeForm>
      )}
    </AuthCard>
  );
}
