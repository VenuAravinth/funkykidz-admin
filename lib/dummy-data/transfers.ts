import type { StockTransfer } from "@/types/transfer";
import { MAIN_STORE_ID, BRANCH_2_ID, BRANCH_3_ID, WAREHOUSE_ID } from "./locations";

export const transfers: StockTransfer[] = [
  {
    id: "trf_1",
    transferNumber: "TRF-0001",
    fromLocationId: MAIN_STORE_ID,
    toLocationId: BRANCH_2_ID,
    productId: "prd_5",
    quantity: 10,
    reason: "Stock Rebalancing",
    status: "requested",
    requestedBy: "Anita Rao",
    createdAt: "2026-08-20T09:30:00+05:30",
    history: [
      { status: "draft", at: "2026-08-20T09:30:00+05:30", by: "Anita Rao" },
      { status: "requested", at: "2026-08-20T09:31:00+05:30", by: "Anita Rao" },
    ],
  },
  {
    id: "trf_2",
    transferNumber: "TRF-0002",
    fromLocationId: WAREHOUSE_ID,
    toLocationId: BRANCH_3_ID,
    productId: "prd_7",
    quantity: 12,
    reason: "New Branch Stocking",
    status: "draft",
    requestedBy: "Demo User",
    createdAt: "2026-08-24T14:00:00+05:30",
    history: [{ status: "draft", at: "2026-08-24T14:00:00+05:30", by: "Demo User" }],
  },
];
