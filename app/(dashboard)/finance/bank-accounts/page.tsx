"use client";

import Link from "next/link";
import { HiOutlinePlus, HiOutlineBuildingLibrary } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { formatCurrency } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectBankAccounts } from "@/stores/slices/financeSlice";

export default function BankAccountsPage() {
  const bankAccounts = useAppSelector(selectBankAccounts);

  return (
    <div>
      <PageHeader
        title="Bank Accounts"
        subtitle="Every account the business holds money in."
        actions={
          <Link href="/finance/bank-accounts/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Add Bank Account
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {bankAccounts.map((account) => (
          <Card key={account.id} className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-champagne-100 text-champagne-600">
                <HiOutlineBuildingLibrary className="h-5 w-5" />
              </div>
              <Badge tone="info">{account.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{account.name}</p>
              <p className="text-xs text-ink-muted">
                {account.bankName} · {account.accountNumber}
              </p>
            </div>
            <div className="border-t border-glass-border pt-3">
              <p className="text-xs text-ink-muted">Balance</p>
              <p className="text-xl font-semibold tracking-tight text-ink">{formatCurrency(account.balance)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
