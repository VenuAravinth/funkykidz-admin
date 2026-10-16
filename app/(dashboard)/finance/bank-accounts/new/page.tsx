import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { BankAccountForm } from "@/components/organisms/BankAccountForm";

export const metadata: Metadata = {
  title: "Add Bank Account — Finance",
};

export default function AddBankAccountPage() {
  return (
    <div>
      <PageHeader title="Add Bank Account" subtitle="Track balances for a new bank account." backHref="/finance/bank-accounts" backLabel="Back to Bank Accounts" />
      <Card className="max-w-3xl p-6">
        <BankAccountForm />
      </Card>
    </div>
  );
}
