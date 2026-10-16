import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { ExpenseForm } from "@/components/organisms/ExpenseForm";

export const metadata: Metadata = {
  title: "Add Expense — Finance",
};

export default function AddExpensePage() {
  return (
    <div>
      <PageHeader title="Add Expense" subtitle="Record money going out of the business." backHref="/finance/expenses" backLabel="Back to Expenses" />
      <Card className="max-w-3xl p-6">
        <ExpenseForm />
      </Card>
    </div>
  );
}
