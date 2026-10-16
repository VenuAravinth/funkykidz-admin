import type { CustomerPayment } from "@/types/payment";
import type { OnlineOrder } from "@/types/onlineOrder";

export interface PaymentTransactionRow {
  date: string;
  invoiceNumber: string;
  customerName: string;
  method: string;
  amount: number;
  status: CustomerPayment["status"];
}

export function computePaymentTransactions(payments: CustomerPayment[]): PaymentTransactionRow[] {
  return [...payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => ({
      date: p.date,
      invoiceNumber: p.invoiceNumber,
      customerName: p.customerName,
      method: p.method,
      amount: p.amount,
      status: p.status,
    }));
}

export function computeRefunds(payments: CustomerPayment[]): CustomerPayment[] {
  return payments.filter((p) => p.type === "refund" || p.status === "refunded").sort((a, b) => b.date.localeCompare(a.date));
}

export function computePartialPayments(payments: CustomerPayment[]): CustomerPayment[] {
  return payments.filter((p) => p.type === "partial").sort((a, b) => b.date.localeCompare(a.date));
}

export interface FailedPaymentRow {
  orderNumber: string;
  customerName: string;
  date: string;
  method: string;
  amount: number;
}

export function computeFailedPayments(orders: OnlineOrder[]): FailedPaymentRow[] {
  return orders
    .filter((o) => o.paymentStatus === "failed")
    .map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      date: o.createdDate,
      method: o.paymentMethod,
      amount: o.items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
