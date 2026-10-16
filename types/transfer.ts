export const transferStatuses = ["draft", "requested", "approved", "in_transit", "received", "completed"] as const;
export type TransferStatus = (typeof transferStatuses)[number];

export interface TransferHistoryEntry {
  status: TransferStatus;
  at: string;
  by: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromLocationId: string;
  toLocationId: string;
  productId: string;
  quantity: number;
  reason: string;
  status: TransferStatus;
  requestedBy: string;
  createdAt: string;
  history: TransferHistoryEntry[];
}
