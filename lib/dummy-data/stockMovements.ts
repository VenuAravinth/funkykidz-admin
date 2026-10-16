import type { StockMovement } from "@/types/stock";

export const stockMovements: StockMovement[] = [
  { id: "mov_1", productId: "prd_1", barcode: "2000090000049", date: "2026-07-20", type: "Opening Stock", reference: "OPEN-1001", quantity: 100, balanceBefore: 0, balanceAfter: 100, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_2", productId: "prd_1", barcode: "2000090000049", date: "2026-08-02", type: "Purchase", reference: "PO-1031", quantity: 40, balanceBefore: 100, balanceAfter: 140, performedBy: "Anita Rao", reason: "GRN from Radiant Textile Mills" },
  { id: "mov_3", productId: "prd_1", barcode: "2000090000049", date: "2026-08-05", type: "Sale", reference: "INV-3105", quantity: -10, balanceBefore: 140, balanceAfter: 130, performedBy: "Vikram Shah", reason: "Store sale" },
  { id: "mov_4", productId: "prd_1", barcode: "2000090000049", date: "2026-08-10", type: "Sales Return", reference: "RET-210", quantity: 3, balanceBefore: 130, balanceAfter: 133, performedBy: "Priya Nair", reason: "Customer return — size exchange" },
  { id: "mov_5", productId: "prd_1", barcode: "2000090000049", date: "2026-08-12", type: "Damage", reference: "ADJ-118", quantity: -5, balanceBefore: 133, balanceAfter: 128, performedBy: "Demo User", reason: "Damaged in transit" },

  { id: "mov_6", productId: "prd_2", barcode: "2000090000155", date: "2026-07-26", type: "Opening Stock", reference: "OPEN-1002", quantity: 25, balanceBefore: 0, balanceAfter: 25, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_7", productId: "prd_2", barcode: "2000090000155", date: "2026-08-04", type: "Sale", reference: "INV-3122", quantity: -20, balanceBefore: 25, balanceAfter: 5, performedBy: "Vikram Shah", reason: "Store sale" },
  { id: "mov_8", productId: "prd_2", barcode: "2000090000155", date: "2026-08-10", type: "Sale", reference: "INV-3155", quantity: -5, balanceBefore: 5, balanceAfter: 0, performedBy: "Vikram Shah", reason: "Store sale" },

  { id: "mov_9", productId: "prd_3", barcode: "2000090000162", date: "2026-07-25", type: "Opening Stock", reference: "OPEN-2001", quantity: 30, balanceBefore: 0, balanceAfter: 30, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_10", productId: "prd_3", barcode: "2000090000162", date: "2026-08-03", type: "Purchase", reference: "PO-1042", quantity: 15, balanceBefore: 30, balanceAfter: 45, performedBy: "Anita Rao", reason: "GRN from Radiant Textile Mills" },
  { id: "mov_11", productId: "prd_3", barcode: "2000090000162", date: "2026-08-09", type: "Sale", reference: "INV-3142", quantity: -4, balanceBefore: 45, balanceAfter: 41, performedBy: "Vikram Shah", reason: "Store sale" },
  { id: "mov_12", productId: "prd_3", barcode: "2000090000162", date: "2026-08-13", type: "Transfer In", reference: "TRF-014", quantity: 3, balanceBefore: 41, balanceAfter: 44, performedBy: "Priya Nair", reason: "Stock transferred from Andheri outlet" },
  { id: "mov_13", productId: "prd_3", barcode: "2000090000162", date: "2026-08-15", type: "Damage", reference: "ADJ-121", quantity: -2, balanceBefore: 44, balanceAfter: 42, performedBy: "Demo User", reason: "Torn during quality check" },

  { id: "mov_14", productId: "prd_4", barcode: "2000090000124", date: "2026-08-01", type: "Opening Stock", reference: "OPEN-2002", quantity: 25, balanceBefore: 0, balanceAfter: 25, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_15", productId: "prd_4", barcode: "2000090000124", date: "2026-08-09", type: "Sale", reference: "INV-3148", quantity: -6, balanceBefore: 25, balanceAfter: 19, performedBy: "Vikram Shah", reason: "Store sale" },
  { id: "mov_16", productId: "prd_4", barcode: "2000090000124", date: "2026-08-14", type: "Damage", reference: "ADJ-127", quantity: -2, balanceBefore: 19, balanceAfter: 17, performedBy: "Demo User", reason: "Faded print — pulled from floor" },

  { id: "mov_17", productId: "prd_5", barcode: "2000090000032", date: "2026-07-22", type: "Opening Stock", reference: "OPEN-3001", quantity: 50, balanceBefore: 0, balanceAfter: 50, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_18", productId: "prd_5", barcode: "2000090000032", date: "2026-08-04", type: "Purchase", reference: "PO-1055", quantity: 20, balanceBefore: 50, balanceAfter: 70, performedBy: "Anita Rao", reason: "GRN from EcoPack Solutions" },
  { id: "mov_19", productId: "prd_5", barcode: "2000090000032", date: "2026-08-08", type: "Sale", reference: "INV-3160", quantity: -8, balanceBefore: 70, balanceAfter: 62, performedBy: "Vikram Shah", reason: "Store sale" },
  { id: "mov_20", productId: "prd_5", barcode: "2000090000032", date: "2026-08-11", type: "Lost", reference: "LST-009", quantity: -1, balanceBefore: 62, balanceAfter: 61, performedBy: "Priya Nair", reason: "Missing during stock count" },
  { id: "mov_21", productId: "prd_5", barcode: "2000090000032", date: "2026-08-15", type: "Purchase", reference: "PO-1071", quantity: 4, balanceBefore: 61, balanceAfter: 65, performedBy: "Anita Rao", reason: "GRN from EcoPack Solutions" },

  { id: "mov_22", productId: "prd_6", barcode: "2000090000179", date: "2026-07-29", type: "Opening Stock", reference: "OPEN-3002", quantity: 18, balanceBefore: 0, balanceAfter: 18, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_23", productId: "prd_6", barcode: "2000090000179", date: "2026-08-06", type: "Damage", reference: "ADJ-119", quantity: -4, balanceBefore: 18, balanceAfter: 14, performedBy: "Demo User", reason: "Water damage in storage" },
  { id: "mov_24", productId: "prd_6", barcode: "2000090000179", date: "2026-08-12", type: "Sale", reference: "INV-3162", quantity: -10, balanceBefore: 14, balanceAfter: 4, performedBy: "Vikram Shah", reason: "Store sale" },
  { id: "mov_25", productId: "prd_6", barcode: "2000090000179", date: "2026-08-15", type: "Lost", reference: "LST-011", quantity: -4, balanceBefore: 4, balanceAfter: 0, performedBy: "Priya Nair", reason: "Missing during stock count" },

  { id: "mov_26", productId: "prd_7", barcode: "2000090000148", date: "2026-07-28", type: "Opening Stock", reference: "OPEN-4001", quantity: 70, balanceBefore: 0, balanceAfter: 70, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_27", productId: "prd_7", barcode: "2000090000148", date: "2026-08-05", type: "Purchase", reference: "PO-1048", quantity: 25, balanceBefore: 70, balanceAfter: 95, performedBy: "Anita Rao", reason: "GRN from Swift Freight Logistics" },
  { id: "mov_28", productId: "prd_7", barcode: "2000090000148", date: "2026-08-09", type: "Sale", reference: "INV-3151", quantity: -10, balanceBefore: 95, balanceAfter: 85, performedBy: "Vikram Shah", reason: "Store sale" },
  { id: "mov_29", productId: "prd_7", barcode: "2000090000148", date: "2026-08-13", type: "Sales Return", reference: "RET-215", quantity: 2, balanceBefore: 85, balanceAfter: 87, performedBy: "Priya Nair", reason: "Customer return — wrong size" },
  { id: "mov_30", productId: "prd_7", barcode: "2000090000148", date: "2026-08-16", type: "Stock Adjustment", reference: "ADJ-130", quantity: 1, balanceBefore: 87, balanceAfter: 88, performedBy: "Demo User", reason: "Recount correction" },

  { id: "mov_31", productId: "prd_8", barcode: "2000090000087", date: "2026-07-18", type: "Opening Stock", reference: "OPEN-5001", quantity: 180, balanceBefore: 0, balanceAfter: 180, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_32", productId: "prd_8", barcode: "2000090000087", date: "2026-08-01", type: "Purchase", reference: "PO-1020", quantity: 40, balanceBefore: 180, balanceAfter: 220, performedBy: "Anita Rao", reason: "GRN from Sunrise Cotton Weavers" },
  { id: "mov_33", productId: "prd_8", barcode: "2000090000087", date: "2026-08-07", type: "Sale", reference: "INV-3130", quantity: -15, balanceBefore: 220, balanceAfter: 205, performedBy: "Vikram Shah", reason: "Store sale" },
  { id: "mov_34", productId: "prd_8", barcode: "2000090000087", date: "2026-08-12", type: "Sales Return", reference: "RET-208", quantity: 5, balanceBefore: 205, balanceAfter: 210, performedBy: "Priya Nair", reason: "Customer return — unopened pack" },

  { id: "mov_35", productId: "prd_9", barcode: "2000090000131", date: "2026-07-30", type: "Opening Stock", reference: "OPEN-6001", quantity: 20, balanceBefore: 0, balanceAfter: 20, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_36", productId: "prd_9", barcode: "2000090000131", date: "2026-08-06", type: "Sale", reference: "INV-3140", quantity: -12, balanceBefore: 20, balanceAfter: 8, performedBy: "Vikram Shah", reason: "Store sale" },
  { id: "mov_37", productId: "prd_9", barcode: "2000090000131", date: "2026-08-14", type: "Damage", reference: "ADJ-125", quantity: -2, balanceBefore: 8, balanceAfter: 6, performedBy: "Demo User", reason: "Zip defect found on inspection" },
  { id: "mov_38", productId: "prd_9", barcode: "2000090000131", date: "2026-08-15", type: "Sale", reference: "INV-3178", quantity: -1, balanceBefore: 6, balanceAfter: 5, performedBy: "Vikram Shah", reason: "Store sale" },

  { id: "mov_39", productId: "prd_10", barcode: "2000090000056", date: "2026-08-02", type: "Opening Stock", reference: "OPEN-6002", quantity: 28, balanceBefore: 0, balanceAfter: 28, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_40", productId: "prd_10", barcode: "2000090000056", date: "2026-08-10", type: "Purchase", reference: "PO-1060", quantity: 10, balanceBefore: 28, balanceAfter: 38, performedBy: "Anita Rao", reason: "GRN from Radiant Textile Mills" },
  { id: "mov_41", productId: "prd_10", barcode: "2000090000056", date: "2026-08-13", type: "Sale", reference: "INV-3170", quantity: -5, balanceBefore: 38, balanceAfter: 33, performedBy: "Vikram Shah", reason: "Store sale" },

  { id: "mov_42", productId: "prd_11", barcode: "2000090000186", date: "2026-07-15", type: "Opening Stock", reference: "OPEN-7001", quantity: 12, balanceBefore: 0, balanceAfter: 12, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_43", productId: "prd_11", barcode: "2000090000186", date: "2026-07-30", type: "Sale", reference: "INV-3080", quantity: -8, balanceBefore: 12, balanceAfter: 4, performedBy: "Vikram Shah", reason: "Store sale" },
  { id: "mov_44", productId: "prd_11", barcode: "2000090000186", date: "2026-08-05", type: "Sale", reference: "INV-3110", quantity: -4, balanceBefore: 4, balanceAfter: 0, performedBy: "Vikram Shah", reason: "Clearance sale — AW26 changeover" },

  { id: "mov_45", productId: "prd_12", barcode: "2000090000070", date: "2026-08-03", type: "Opening Stock", reference: "OPEN-1003", quantity: 60, balanceBefore: 0, balanceAfter: 60, performedBy: "System", reason: "Opening balance for FY26-27" },
  { id: "mov_46", productId: "prd_12", barcode: "2000090000070", date: "2026-08-10", type: "Purchase", reference: "PO-1065", quantity: 15, balanceBefore: 60, balanceAfter: 75, performedBy: "Anita Rao", reason: "GRN from Swift Freight Logistics" },
  { id: "mov_47", productId: "prd_12", barcode: "2000090000070", date: "2026-08-14", type: "Sale", reference: "INV-3175", quantity: -1, balanceBefore: 75, balanceAfter: 74, performedBy: "Vikram Shah", reason: "Store sale" },
];
