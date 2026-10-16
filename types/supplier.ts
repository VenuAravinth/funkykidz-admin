export type SupplierStatus = "active" | "inactive";

export type SupplierCategory = "Fabric" | "Trims" | "Packaging" | "Printing" | "Logistics";

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: SupplierCategory;
  gstNumber: string;
  city: string;
  state: string;
  country: string;
  paymentTerms: string;
  status: SupplierStatus;
  rating: number;
  totalPurchases: number;
  outstandingAmount: number;
  joinedDate: string;
  lastActivityDate: string;
  notes?: string;
}

export type POStatus = "pending" | "received" | "partial" | "cancelled";

export interface POLineItem {
  id: string;
  description: string;
  barcode: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: POStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  items: POLineItem[];
  tax: number;
  notes?: string;
}

export type GoodsReceiptType = "full" | "partial" | "damaged";

export interface GoodsReceiptItem {
  id: string;
  description: string;
  orderedQty: number;
  receivedQty: number;
  damagedQty: number;
  missingQty: number;
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  type: GoodsReceiptType;
  receivedDate: string;
  receivedBy: string;
  items: GoodsReceiptItem[];
  remarks?: string;
}

export type PaymentStatus = "pending" | "paid" | "partial";

export interface SupplierPayment {
  id: string;
  paymentRef: string;
  supplierId: string;
  supplierName: string;
  poId?: string;
  poNumber?: string;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  method?: "Bank Transfer" | "Cheque" | "UPI" | "Cash";
}

export type ActivityType = "supplier" | "purchase_order" | "goods_received" | "payment";

export interface SupplierActivity {
  id: string;
  type: ActivityType;
  message: string;
  supplierName: string;
  timestamp: string;
}
