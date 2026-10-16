"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/stores/hooks";
import { selectProducts } from "@/stores/slices/catalogSlice";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import { selectOnlineOrders } from "@/stores/slices/onlineOrdersSlice";
import { selectStockAdjustments } from "@/stores/slices/stockAdjustmentsSlice";
import { selectReadIds, selectDismissedIds } from "@/stores/slices/notificationsUiSlice";
import { buildNotifications } from "@/lib/notifications";
import type { AppNotification } from "@/types/notification";

export interface NotificationWithReadState extends AppNotification {
  read: boolean;
}

export function useNotifications(): NotificationWithReadState[] {
  const products = useAppSelector(selectProducts);
  const invoices = useAppSelector(selectInvoices);
  const onlineOrders = useAppSelector(selectOnlineOrders);
  const stockAdjustments = useAppSelector(selectStockAdjustments);
  const readIds = useAppSelector(selectReadIds);
  const dismissedIds = useAppSelector(selectDismissedIds);

  return useMemo(() => {
    const notifications = buildNotifications({ products, invoices, onlineOrders, stockAdjustments });
    return notifications
      .filter((n) => !dismissedIds.includes(n.id))
      .map((n) => ({ ...n, read: readIds.includes(n.id) }));
  }, [products, invoices, onlineOrders, stockAdjustments, readIds, dismissedIds]);
}
