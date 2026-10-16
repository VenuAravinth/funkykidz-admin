"use client";

import Link from "next/link";
import { HiOutlinePlus, HiOutlineBanknotes, HiOutlineArrowDownCircle, HiOutlineArrowUpCircle } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { Button } from "@/components/atoms/Button";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectBankAccounts, selectCashBalance, selectCashMovements } from "@/stores/slices/financeSlice";

export default function CashManagementPage() {
  const cashBalance = useAppSelector(selectCashBalance);
  const movements = useAppSelector(selectCashMovements);
  const bankAccounts = useAppSelector(selectBankAccounts);

  const deposited = movements.filter((m) => m.direction === "deposit").reduce((sum, m) => sum + m.amount, 0);
  const withdrawn = movements.filter((m) => m.direction === "withdraw").reduce((sum, m) => sum + m.amount, 0);
  const accountName = (id: string) => bankAccounts.find((a) => a.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader
        title="Cash Management"
        subtitle="Cash in hand, and movement between the till and the bank."
        actions={
          <Link href="/finance/cash/new">
            <Button>
              <HiOutlinePlus className="h-4 w-4" />
              Add Movement
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile label="Cash in Hand" value={formatCurrency(cashBalance)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Deposited to Bank" value={formatCurrency(deposited)} icon={<HiOutlineArrowUpCircle className="h-5 w-5" />} tone="sky" />
        <StatTile label="Withdrawn from Bank" value={formatCurrency(withdrawn)} icon={<HiOutlineArrowDownCircle className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="mt-5">
        <Table>
          <TableHead>
            <TableRow>
              <Th>Date</Th>
              <Th>Movement</Th>
              <Th>Bank Account</Th>
              <Th>Amount</Th>
              <Th>Notes</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.length === 0 && <TableEmpty colSpan={5} message="No cash movements recorded yet." />}
            {movements.map((m) => (
              <TableRow key={m.id}>
                <Td>{formatDate(m.date)}</Td>
                <Td className="capitalize">{m.direction === "deposit" ? "Deposit to Bank" : "Withdraw from Bank"}</Td>
                <Td>{accountName(m.bankAccountId)}</Td>
                <Td className="font-medium text-ink">{formatCurrency(m.amount)}</Td>
                <Td>{m.notes ?? "—"}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
