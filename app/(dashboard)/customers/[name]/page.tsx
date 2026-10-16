"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency, formatDate, addDays } from "@/lib/format";
import { getCustomerSummary, buildCustomerLedger } from "@/lib/customers";
import { invoiceGrandTotal, invoiceBalance } from "@/lib/dummy-data/invoices";
import { salesOrderTotal } from "@/lib/dummy-data/salesOrders";
import {
  HiOutlineShoppingBag,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineCalendarDays,
  HiOutlinePencilSquare,
} from "react-icons/hi2";
import { useAppSelector } from "@/stores/hooks";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import { selectSalesOrders } from "@/stores/slices/salesOrdersSlice";
import { selectCustomerPayments } from "@/stores/slices/customerPaymentsSlice";
import { selectReturns } from "@/stores/slices/returnsSlice";
import { selectCustomerByName, selectCustomerGroupById } from "@/stores/slices/customersSlice";

const NOT_OUTSTANDING_STATUSES = new Set(["draft", "cancelled", "refunded"]);

export default function CustomerDetailsPage() {
  const { name } = useParams<{ name: string }>();
  const customerName = decodeURIComponent(name);

  const allInvoices = useAppSelector(selectInvoices);
  const allSalesOrders = useAppSelector(selectSalesOrders);
  const allPayments = useAppSelector(selectCustomerPayments);
  const allReturns = useAppSelector(selectReturns);
  const customer = useAppSelector((state) => selectCustomerByName(state, customerName));
  const group = useAppSelector((state) => (customer ? selectCustomerGroupById(state, customer.groupId) : undefined));

  const invoiceSummary = getCustomerSummary(allInvoices, customerName);
  const invoices = allInvoices.filter((i) => i.customerName === customerName);
  const salesOrders = allSalesOrders.filter((o) => o.customerName === customerName);
  const payments = allPayments.filter((p) => p.customerName === customerName);
  const returns = allReturns.filter((r) => r.customerName === customerName);
  const outstandingInvoices = invoices.filter((i) => !NOT_OUTSTANDING_STATUSES.has(i.status) && invoiceBalance(i) > 0);
  const ledger = buildCustomerLedger(allInvoices, allPayments, customerName);
  const totalPurchases = ledger.reduce((sum, e) => sum + e.debit, 0);
  const totalPayments = ledger.reduce((sum, e) => sum + e.credit, 0);

  if (!invoiceSummary && !customer) {
    return (
      <div>
        <PageHeader title={customerName} backHref="/customers" backLabel="Back to Customers" />
        <p className="text-sm text-ink-muted">No billed orders found for this customer yet.</p>
      </div>
    );
  }

  const summary = invoiceSummary ?? {
    name: customerName,
    phone: customer?.phone ?? "—",
    totalOrders: 0,
    totalPurchases: 0,
    outstanding: 0,
    lastPurchaseDate: undefined as string | undefined,
  };

  return (
    <div>
      <PageHeader
        title={summary.name}
        subtitle={summary.phone !== "—" ? summary.phone : "No phone on file"}
        backHref="/customers"
        backLabel="Back to Customers"
        actions={
          customer && (
            <Link href={`/customers/${encodeURIComponent(customer.name)}/edit`}>
              <Button variant="secondary">
                <HiOutlinePencilSquare className="h-4 w-4" />
                Edit Customer
              </Button>
            </Link>
          )
        }
      />

      {customer && (
        <Card className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
          <div>
            <div className="text-xs font-medium text-ink-muted">Group</div>
            <div className="text-sm font-medium text-ink">{group?.name ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-muted">Type</div>
            <div className="text-sm font-medium text-ink">{customer.customerType}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-muted">Credit</div>
            <div className="text-sm font-medium text-ink">
              {customer.allowCredit ? formatCurrency(customer.creditLimit) : "Not allowed"}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-muted">Payment Terms</div>
            <div className="text-sm font-medium text-ink">{customer.paymentTerms}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-muted">Status</div>
            <StatusBadge status={customer.status} />
          </div>
          {customer.notes && (
            <div className="w-full basis-full">
              <div className="text-xs font-medium text-ink-muted">Notes</div>
              <div className="text-sm text-ink">{customer.notes}</div>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Orders" value={String(summary.totalOrders)} icon={<HiOutlineShoppingBag className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Total Purchases" value={formatCurrency(summary.totalPurchases)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="emerald" />
        <StatTile
          label="Outstanding"
          value={formatCurrency(summary.outstanding)}
          icon={<HiOutlineExclamationTriangle className="h-5 w-5" />}
          tone={summary.outstanding > 0 ? "rose" : "emerald"}
        />
        <StatTile
          label="Last Purchase"
          value={summary.lastPurchaseDate ? formatDate(summary.lastPurchaseDate) : "—"}
          icon={<HiOutlineCalendarDays className="h-5 w-5" />}
          tone="sky"
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-ink">Purchase History</h2>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Sales Order</Th>
              <Th>Date</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {salesOrders.length === 0 && <TableEmpty colSpan={4} message="No sales orders for this customer." />}
            {salesOrders.map((o) => (
              <TableRow key={o.id}>
                <Td>
                  <Link href={`/sales/orders/${o.id}`} className="font-medium text-ink hover:text-champagne-700">
                    {o.soNumber}
                  </Link>
                </Td>
                <Td>{formatDate(o.createdDate)}</Td>
                <Td>{formatCurrency(salesOrderTotal(o))}</Td>
                <Td>
                  <StatusBadge status={o.status} />
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-ink">Invoices</h2>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Invoice</Th>
              <Th>Date</Th>
              <Th>Amount</Th>
              <Th>Balance</Th>
              <Th>Status</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 && <TableEmpty colSpan={5} message="No invoices for this customer." />}
            {invoices.map((i) => (
              <TableRow key={i.id}>
                <Td>
                  <Link href={`/sales/invoices/${i.id}`} className="font-medium text-ink hover:text-champagne-700">
                    {i.invoiceNumber}
                  </Link>
                </Td>
                <Td>{formatDate(i.createdDate)}</Td>
                <Td>{formatCurrency(invoiceGrandTotal(i))}</Td>
                <Td>{formatCurrency(invoiceBalance(i))}</Td>
                <Td>
                  <StatusBadge status={i.status} />
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-ink">Payments</h2>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Date</Th>
              <Th>Invoice</Th>
              <Th>Method</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 && <TableEmpty colSpan={5} message="No payments recorded for this customer." />}
            {payments.map((p) => (
              <TableRow key={p.id}>
                <Td>{formatDate(p.date)}</Td>
                <Td>{p.invoiceNumber}</Td>
                <Td>{p.method}</Td>
                <Td>{formatCurrency(p.amount)}</Td>
                <Td>
                  <StatusBadge status={p.status} />
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-ink">Returns</h2>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Return</Th>
              <Th>Product</Th>
              <Th>Amount</Th>
              <Th>Reason</Th>
              <Th>Status</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {returns.length === 0 && <TableEmpty colSpan={5} message="No returns for this customer." />}
            {returns.map((r) => (
              <TableRow key={r.id}>
                <Td>
                  <Link href={`/sales/returns/${r.id}`} className="font-medium text-ink hover:text-champagne-700">
                    {r.returnNumber}
                  </Link>
                </Td>
                <Td>{r.product}</Td>
                <Td>{formatCurrency(r.amount)}</Td>
                <Td>{r.reason}</Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div id="ledger" className="mt-6 scroll-mt-6">
        <h2 className="mb-3 text-base font-semibold text-ink">Ledger</h2>
        {ledger.length === 0 ? (
          <Card className="p-5 text-sm text-ink-muted">No ledger activity yet.</Card>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
              <StatTile label="Total Purchases" value={formatCurrency(totalPurchases)} icon={<HiOutlineShoppingBag className="h-5 w-5" />} tone="champagne" />
              <StatTile label="Total Payments" value={formatCurrency(totalPayments)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="emerald" />
              <StatTile
                label="Current Outstanding"
                value={formatCurrency(ledger[ledger.length - 1].balance)}
                icon={<HiOutlineExclamationTriangle className="h-5 w-5" />}
                tone={ledger[ledger.length - 1].balance > 0 ? "rose" : "emerald"}
              />
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Debit</Th>
                  <Th>Credit</Th>
                  <Th>Balance</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {ledger.map((entry, i) => (
                  <TableRow key={i}>
                    <Td>{formatDate(entry.date)}</Td>
                    <Td>{entry.description}</Td>
                    <Td>{entry.debit > 0 ? formatCurrency(entry.debit) : "—"}</Td>
                    <Td>{entry.credit > 0 ? formatCurrency(entry.credit) : "—"}</Td>
                    <Td className="font-medium">{formatCurrency(entry.balance)}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-ink">Outstanding</h2>
        {outstandingInvoices.length === 0 ? (
          <Card className="p-5 text-sm text-ink-muted">No outstanding balance — fully paid up.</Card>
        ) : (
          <Table stickyActions>
            <TableHead>
              <TableRow>
                <Th>Invoice</Th>
                <Th>Invoice Total</Th>
                <Th>Paid</Th>
                <Th>Outstanding</Th>
                <Th>Due Date</Th>
                <Th>Actions</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {outstandingInvoices.map((i) => (
                <TableRow key={i.id}>
                  <Td>
                    <Link href={`/sales/invoices/${i.id}`} className="font-medium text-ink hover:text-champagne-700">
                      {i.invoiceNumber}
                    </Link>
                  </Td>
                  <Td>{formatCurrency(invoiceGrandTotal(i))}</Td>
                  <Td>{formatCurrency(i.paidAmount)}</Td>
                  <Td className="font-semibold text-red-600">{formatCurrency(invoiceBalance(i))}</Td>
                  <Td>{formatDate(addDays(i.createdDate, 15))}</Td>
                  <Td>
                    <Link href={`/sales/payments/new?invoiceId=${i.id}`} className="text-sm font-medium text-champagne-600 hover:text-champagne-700">
                      Record Payment
                    </Link>
                  </Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
