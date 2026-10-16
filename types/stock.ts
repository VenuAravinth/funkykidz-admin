export const movementTypes = [
  "Purchase",
  "Sale",
  "Sales Return",
  "Purchase Return",
  "Stock Adjustment",
  "Damage",
  "Lost",
  "Transfer In",
  "Transfer Out",
  "Opening Stock",
] as const;

export type MovementType = (typeof movementTypes)[number];

export interface StockMovement {
  id: string;
  productId: string;
  barcode: string;
  date: string;
  type: MovementType;
  reference: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  performedBy: string;
  reason: string;
}
