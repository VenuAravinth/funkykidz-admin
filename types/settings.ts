export const businessTypes = ["Retail", "Wholesale", "Manufacturing", "Retail & Wholesale"] as const;
export type BusinessType = (typeof businessTypes)[number];

export const indianStates = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "West Bengal",
  "Punjab",
] as const;
export type IndianState = (typeof indianStates)[number];

export interface BusinessProfileSettings {
  businessName: string;
  legalName?: string;
  businessType: BusinessType;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address: string;
  city?: string;
  state: IndianState;
  pincode?: string;
  country: string;
  gstin?: string;
  pan?: string;
  registrationNumber?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryBrandName: string;
}

export const storeTypes = ["Retail Store", "Warehouse", "Franchise Outlet"] as const;
export type StoreType = (typeof storeTypes)[number];

export const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type Weekday = (typeof weekdays)[number];

export interface BusinessHoursEntry {
  day: Weekday;
  open: string;
  close: string;
  closed: boolean;
}

export interface PosSettings {
  allowWalkInCustomer: boolean;
  requireCustomerName: boolean;
  requireContactNumber: boolean;
  allowCreditSale: boolean;
  allowNegativeStock: boolean;
  autoHoldCart: boolean;
  autoGenerateInvoice: boolean;
  autoPrintReceipt: boolean;
}

export interface StockSettings {
  defaultReorderLevel: number;
  allowStockOverride: boolean;
  allowNegativeStock: boolean;
  trackDamagedStock: boolean;
  trackReservedStock: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeCode: string;
  storeType: StoreType;
  timezone: string;
  currency: string;
  businessHours: BusinessHoursEntry[];
  pos: PosSettings;
  stock: StockSettings;
}

export const invoiceDocumentTypes = [
  "invoices",
  "quotations",
  "estimations",
  "salesOrders",
  "purchaseOrders",
  "creditNotes",
  "debitNotes",
  "returns",
] as const;
export type InvoiceDocumentType = (typeof invoiceDocumentTypes)[number];

export const invoiceDocumentLabels: Record<InvoiceDocumentType, string> = {
  invoices: "Invoices",
  quotations: "Quotations",
  estimations: "Estimations",
  salesOrders: "Sales Orders",
  purchaseOrders: "Purchase Orders",
  creditNotes: "Credit Notes",
  debitNotes: "Debit Notes",
  returns: "Returns",
};

export interface NumberSequence {
  prefix: string;
  startingNumber: number;
}

export const invoiceStyles = ["Standard", "Compact POS", "Detailed"] as const;
export type InvoiceStyle = (typeof invoiceStyles)[number];

export interface InvoiceSettings {
  sequences: Record<InvoiceDocumentType, NumberSequence>;
  style: InvoiceStyle;
  showBusinessLogo: boolean;
  showGstin: boolean;
  showCustomerName: boolean;
  showCustomerPhone: boolean;
  showHsnSac: boolean;
  showBarcode: boolean;
  showTaxBreakdown: boolean;
  showDiscount: boolean;
  showRoundOff: boolean;
  showPaymentMethod: boolean;
  showCashier: boolean;
  showTermsAndConditions: boolean;
  thankYouMessage: string;
}

export const taxSystems = ["GST", "No Tax"] as const;
export type TaxSystem = (typeof taxSystems)[number];

export const gstRegistrationTypes = ["Regular", "Composition", "Unregistered"] as const;
export type GstRegistrationType = (typeof gstRegistrationTypes)[number];

export interface TaxRate {
  id: string;
  name: string;
  ratePercent: number;
}

export const priceTaxModes = ["Tax Inclusive", "Tax Exclusive"] as const;
export type PriceTaxMode = (typeof priceTaxModes)[number];

export const transactionTaxModes = ["Tax Included", "Tax Extra", "No Tax"] as const;
export type TransactionTaxMode = (typeof transactionTaxModes)[number];

export interface TaxSettings {
  taxSystem: TaxSystem;
  gstin: string;
  registrationType: GstRegistrationType;
  state: IndianState;
  rates: TaxRate[];
  productPriceMode: PriceTaxMode;
  allowTransactionLevelTaxChoice: boolean;
  defaultTransactionTaxMode: TransactionTaxMode;
}

export const paymentMethodIds = ["cash", "upi", "card", "bankTransfer", "credit", "cheque"] as const;
export type PaymentMethodId = (typeof paymentMethodIds)[number];

export interface PaymentMethodConfig {
  id: PaymentMethodId;
  label: string;
  enabled: boolean;
  allowInPos: boolean;
  upiId?: string;
  qrCodeUrl?: string;
  paymentGateway?: string;
  provider?: string;
  transactionFeePercent?: number;
  defaultCreditPeriodDays?: number;
  requireApproval?: boolean;
}

export interface PaymentSettings {
  methods: PaymentMethodConfig[];
  allowSplitPayment: boolean;
}

export const barcodeSymbologies = ["CODE128", "EAN-13", "EAN-8", "UPC", "QR Code"] as const;
export type BarcodeSymbology = (typeof barcodeSymbologies)[number];

export const scannerActions = ["Add to Cart", "Search Product", "Receive Stock"] as const;
export type ScannerAction = (typeof scannerActions)[number];

export interface BarcodeLabelFields {
  productName: boolean;
  price: boolean;
  size: boolean;
  color: boolean;
  barcode: boolean;
  businessName: boolean;
}

export interface GlobalBarcodeSettings {
  symbology: BarcodeSymbology;
  barcodePrefix: string;
  labelWidthMm: number;
  labelHeightMm: number;
  labelFields: BarcodeLabelFields;
  scannerActionPos: ScannerAction;
  scannerActionGoodsReceived: ScannerAction;
}

export interface NotificationTypeToggles {
  lowStock: boolean;
  outOfStock: boolean;
  stockAdjustment: boolean;
  poDeliveryDue: boolean;
  poOverdue: boolean;
  supplierPaymentDue: boolean;
  customerPaymentDue: boolean;
  newOnlineOrder: boolean;
  paymentFailed: boolean;
  refund: boolean;
  backupCompleted: boolean;
  backupFailed: boolean;
  userActivity: boolean;
}

export type NotificationChannelKey = "lowStock" | "poOverdue" | "customerDue" | "newOrder";

export interface NotificationChannelRow {
  key: NotificationChannelKey;
  label: string;
  inApp: boolean;
  sound: boolean;
  email: boolean;
}

export interface PaymentReminderSchedule {
  sevenDaysBefore: boolean;
  threeDaysBefore: boolean;
  onDueDate: boolean;
  oneDayOverdue: boolean;
  sevenDaysOverdue: boolean;
}

export interface NotificationSettings {
  types: NotificationTypeToggles;
  channels: NotificationChannelRow[];
  lowStockThreshold: number;
  criticalStockThreshold: number;
  paymentReminders: PaymentReminderSchedule;
}

export const paperSizes = ["58mm", "80mm"] as const;
export type PaperSize = (typeof paperSizes)[number];

export interface ReceiptConfigToggles {
  logo: boolean;
  storeName: boolean;
  address: boolean;
  phone: boolean;
  gstin: boolean;
  customer: boolean;
  products: boolean;
  discount: boolean;
  tax: boolean;
  roundOff: boolean;
  paymentMethod: boolean;
  cashier: boolean;
}

export const printTemplates = [
  "POS Receipt",
  "A4 Invoice",
  "Quotation",
  "Estimation",
  "Purchase Order",
  "Barcode Label",
  "Credit Note",
] as const;
export type PrintTemplate = (typeof printTemplates)[number];

export interface PrintSettings {
  receiptPrinterName: string;
  paperSize: PaperSize;
  autoPrint: boolean;
  invoicePrinterName: string;
  invoiceCopies: number;
  receiptConfig: ReceiptConfigToggles;
}

export const backupFrequencies = ["Daily", "Weekly", "Monthly"] as const;
export type BackupFrequency = (typeof backupFrequencies)[number];

export const backupDestinations = ["Local Server", "Cloud Storage", "Google Drive", "S3-compatible Storage"] as const;
export type BackupDestination = (typeof backupDestinations)[number];

export const backupTypes = ["Automatic", "Manual"] as const;
export type BackupType = (typeof backupTypes)[number];

export const backupStatuses = ["Successful", "Failed", "In Progress"] as const;
export type BackupStatus = (typeof backupStatuses)[number];

export interface BackupHistoryEntry {
  id: string;
  date: string;
  sizeMb: number;
  type: BackupType;
  status: BackupStatus;
}

export interface BackupSettings {
  autoBackupEnabled: boolean;
  frequency: BackupFrequency;
  time: string;
  keepBackupsDays: number;
  destination: BackupDestination;
  lastBackupAt: string;
  lastBackupStatus: BackupStatus;
  databaseSizeMb: number;
  history: BackupHistoryEntry[];
}

export interface ManagerPinRequirements {
  highDiscount: boolean;
  priceOverride: boolean;
  refund: boolean;
  stockAdjustment: boolean;
  invoiceCancellation: boolean;
  supplierPayment: boolean;
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  require2faForAdmin: boolean;
  autoLogoutOnIdle: boolean;
  managerPinRequirements: ManagerPinRequirements;
}

export const onlineStoreStatuses = ["Online", "Offline", "Maintenance"] as const;
export type OnlineStoreStatus = (typeof onlineStoreStatuses)[number];

export interface OnlineStoreInfo {
  storeName: string;
  storeUrl: string;
  storeStatus: OnlineStoreStatus;
  currency: string;
  language: string;
}

export interface OnlineStoreBehavior {
  allowGuestCheckout: boolean;
  requirePhoneNumber: boolean;
  requireEmail: boolean;
  showStockAvailability: boolean;
  allowOutOfStockProducts: boolean;
  allowProductReviews: boolean;
  allowWishlist: boolean;
}

export const reserveStockTriggers = ["Order Creation", "Payment Success"] as const;
export type ReserveStockTrigger = (typeof reserveStockTriggers)[number];

export interface OnlineInventorySettings {
  onlineStockSource: string;
  reserveStockOn: ReserveStockTrigger;
  releaseReservedStockMinutes: number;
}

export interface OnlineOrderPolicy {
  minimumOrderValue: number;
  maximumOrderValue: number;
  codAvailable: boolean;
  codMaximum: number;
}

export interface OnlineShippingPolicy {
  freeShippingAbove: number;
  defaultShippingFee: number;
  codFee: number;
}

export const customerAccountModes = ["Optional", "Required", "Disabled"] as const;
export type CustomerAccountMode = (typeof customerAccountModes)[number];

export interface OnlineCustomerPolicy {
  guestCheckout: boolean;
  customerAccount: CustomerAccountMode;
  phoneMandatory: boolean;
}

export interface OnlineStoreSettings {
  info: OnlineStoreInfo;
  behavior: OnlineStoreBehavior;
  inventory: OnlineInventorySettings;
  orders: OnlineOrderPolicy;
  shipping: OnlineShippingPolicy;
  customer: OnlineCustomerPolicy;
}

export interface Register {
  id: string;
  name: string;
  code: string;
  assignedPrinter?: string;
  assignedCashier?: string;
  openingCash: number;
  paymentMethods: PaymentMethodId[];
}

export interface StoreLocation {
  id: string;
  name: string;
  registers: Register[];
}
