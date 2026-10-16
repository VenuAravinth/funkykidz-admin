import type { OnlineOrder } from "@/types/onlineOrder";
import { onlineOrderTotal } from "@/lib/dummy-data/onlineOrders";

export interface OnlineCustomerSummary {
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

const EXCLUDED_STATUSES = new Set(["cancelled"]);

export function buildOnlineCustomerSummaries(orders: OnlineOrder[]): OnlineCustomerSummary[] {
  const byName = new Map<string, OnlineCustomerSummary>();
  for (const order of orders) {
    if (EXCLUDED_STATUSES.has(order.status)) continue;
    const total = onlineOrderTotal(order);
    const existing = byName.get(order.customerName);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += total;
      if (order.createdDate > existing.lastOrderDate) existing.lastOrderDate = order.createdDate;
    } else {
      byName.set(order.customerName, {
        name: order.customerName,
        phone: order.phone,
        totalOrders: 1,
        totalSpent: total,
        lastOrderDate: order.createdDate,
      });
    }
  }
  return [...byName.values()].sort((a, b) => b.totalSpent - a.totalSpent);
}
