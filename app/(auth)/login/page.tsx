import type { Metadata } from "next";
import { LoginFlow } from "@/components/organisms/LoginFlow";

export const metadata: Metadata = {
  title: "Sign in — Funky Kids ERP",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const { registered } = await searchParams;
  return <LoginFlow notice={registered ? "Account created. Sign in to set up two-factor authentication." : undefined} />;
}
