import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/organisms/AuthCard";
import { ForgotPasswordForm } from "@/components/organisms/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password — Funky Kids ERP",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it after all?{" "}
          <Link href="/login" className="font-medium text-champagne-600 hover:text-champagne-700">
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
