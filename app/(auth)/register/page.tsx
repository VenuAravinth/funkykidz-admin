import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/organisms/AuthCard";
import { RegisterForm } from "@/components/organisms/RegisterForm";

export const metadata: Metadata = {
  title: "Create account — Funky Kids ERP",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Get started with your procurement workspace."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-champagne-600 hover:text-champagne-700">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
