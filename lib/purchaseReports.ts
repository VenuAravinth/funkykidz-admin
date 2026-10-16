import type { GoodsReceipt, PurchaseOrder, Supplier } from "@/types/supplier";
import { poTotal, poSubtotal } from "@/lib/dummy-data/suppliers";

export interface PurchaseSummary {
  totalPurchases: number;
  purchaseOrders: number;
  itemsPurchased: number;
  purchaseReturns: number;
  outstanding: number;
}

export function computePurchaseSummary(
  orders: PurchaseOrder[],
  receipts: GoodsReceipt[],
  suppliers: Supplier[],
): PurchaseSummary {
  const itemsPurchased = orders.reduce((sum, po) => sum + po.items.reduce((a, i) => a + i.receivedQuantity, 0), 0);
  const purchaseReturns = receipts.reduce(
    (sum, gr) => sum + gr.items.reduce((a, i) => a + i.damagedQty + i.missingQty, 0) * averageUnitPrice(orders, gr.poId),
    0,
  );
  return {
    totalPurchases: orders.reduce((sum, po) => sum + poTotal(po), 0),
    purchaseOrders: orders.length,
    itemsPurchased,
    purchaseReturns: Math.round(purchaseReturns),
    outstanding: suppliers.reduce((sum, s) => sum + s.outstandingAmount, 0),
  };
}

function averageUnitPrice(orders: PurchaseOrder[], poId: string): number {
  const po = orders.find((o) => o.id === poId);
  if (!po || po.items.length === 0) return 0;
  const totalQty = po.items.reduce((sum, i) => sum + i.quantity, 0);
  return totalQty > 0 ? poSubtotal(po) / totalQty : 0;
}

export interface DailyPurchaseRow {
  date: string;
  orders: number;
  amount: number;
}

export function computeDailyPurchases(orders: PurchaseOrder[]): DailyPurchaseRow[] {
  const map = new Map<string, DailyPurchaseRow>();
  for (const po of orders) {
    const existing = map.get(po.orderDate);
    if (existing) {
      existing.orders += 1;
      existing.amount += poTotal(po);
    } else {
      map.set(po.orderDate, { date: po.orderDate, orders: 1, amount: poTotal(po) });
    }
  }
  return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export interface MonthlyPurchaseRow {
  month: string;
  orders: number;
  amount: number;
}

export function computeMonthlyPurchases(orders: PurchaseOrder[]): MonthlyPurchaseRow[] {
  const map = new Map<string, MonthlyPurchaseRow>();
  for (const po of orders) {
    const month = po.orderDate.slice(0, 7);
    const existing = map.get(month);
    if (existing) {
      existing.orders += 1;
      existing.amount += poTotal(po);
    } else {
      map.set(month, { month, orders: 1, amount: poTotal(po) });
    }
  }
  return [...map.values()].sort((a, b) => b.month.localeCompare(a.month));
}

export interface SupplierPurchaseRow {
  supplierId: string;
  supplierName: string;
  orders: number;
  units: number;
  value: number;
}

export function computeSupplierPurchases(orders: PurchaseOrder[]): SupplierPurchaseRow[] {
  const map = new Map<string, SupplierPurchaseRow>();
  for (const po of orders) {
    const units = po.items.reduce((sum, i) => sum + i.quantity, 0);
    const existing = map.get(po.supplierId);
    if (existing) {
      existing.orders += 1;
      existing.units += units;
      existing.value += poTotal(po);
    } else {
      map.set(po.supplierId, { supplierId: po.supplierId, supplierName: po.supplierName, orders: 1, units, value: poTotal(po) });
    }
  }
  return [...map.values()].sort((a, b) => b.value - a.value);
}

export interface ProductPurchaseRow {
  barcode: string;
  description: string;
  quantityPurchased: number;
  purchaseCost: number;
  averagePrice: number;
  lastPrice: number;
  lastPurchaseDate: string;
}

export function computeProductPurchases(orders: PurchaseOrder[]): ProductPurchaseRow[] {
  const map = new Map<string, { barcode: string; description: string; quantity: number; cost: number; prices: { price: number; date: string }[] }>();
  for (const po of orders) {
    for (const item of po.items) {
      const existing = map.get(item.barcode);
      const cost = item.quantity * item.unitPrice;
      if (existing) {
        existing.quantity += item.quantity;
        existing.cost += cost;
        existing.prices.push({ price: item.unitPrice, date: po.orderDate });
      } else {
        map.set(item.barcode, { barcode: item.barcode, description: item.description, quantity: item.quantity, cost, prices: [{ price: item.unitPrice, date: po.orderDate }] });
      }
    }
  }
  return [...map.values()]
    .map((row) => {
      const latest = [...row.prices].sort((a, b) => b.date.localeCompare(a.date))[0];
      return {
        barcode: row.barcode,
        description: row.description,
        quantityPurchased: row.quantity,
        purchaseCost: row.cost,
        averagePrice: row.quantity > 0 ? row.cost / row.quantity : 0,
        lastPrice: latest.price,
        lastPurchaseDate: latest.date,
      };
    })
    .sort((a, b) => b.purchaseCost - a.purchaseCost);
}

export interface PurchaseOrderReportRow {
  poNumber: string;
  supplierName: string;
  amount: number;
  receivedAmount: number;
  pendingQuantity: number;
  expectedDate: string;
  status: PurchaseOrder["status"];
}

export function computePurchaseOrderReport(orders: PurchaseOrder[]): PurchaseOrderReportRow[] {
  return orders
    .map((po) => {
      const receivedAmount = po.items.reduce((sum, i) => sum + i.receivedQuantity * i.unitPrice, 0);
      const pendingQuantity = po.items.reduce((sum, i) => sum + Math.max(i.quantity - i.receivedQuantity, 0), 0);
      return {
        poNumber: po.poNumber,
        supplierName: po.supplierName,
        amount: poTotal(po),
        receivedAmount: Math.round(receivedAmount * (1 + po.tax / 100)),
        pendingQuantity,
        expectedDate: po.expectedDeliveryDate,
        status: po.status,
      };
    })
    .sort((a, b) => b.expectedDate.localeCompare(a.expectedDate));
}

export interface PurchaseReturnRow {
  grnNumber: string;
  supplierName: string;
  poNumber: string;
  reason: string;
  quantity: number;
  value: number;
}

export function computePurchaseReturns(receipts: GoodsReceipt[], orders: PurchaseOrder[]): PurchaseReturnRow[] {
  const rows: PurchaseReturnRow[] = [];
  for (const gr of receipts) {
    const po = orders.find((o) => o.id === gr.poId);
    for (const item of gr.items) {
      const quantity = item.damagedQty + item.missingQty;
      if (quantity === 0) continue;
      const unitPrice = po?.items.find((i) => i.description === item.description)?.unitPrice ?? 0;
      rows.push({
        grnNumber: gr.grnNumber,
        supplierName: gr.supplierName,
        poNumber: gr.poNumber,
        reason: item.damagedQty > 0 && item.missingQty > 0 ? "Damaged & Missing" : item.damagedQty > 0 ? "Damaged" : "Missing",
        quantity,
        value: quantity * unitPrice,
      });
    }
  }
  return rows.sort((a, b) => b.value - a.value);
}
