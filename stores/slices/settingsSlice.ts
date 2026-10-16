import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  BackupHistoryEntry,
  BackupSettings,
  BusinessHoursEntry,
  BusinessProfileSettings,
  GlobalBarcodeSettings,
  InvoiceSettings,
  ManagerPinRequirements,
  NotificationChannelKey,
  NotificationSettings,
  NotificationTypeToggles,
  OnlineCustomerPolicy,
  OnlineInventorySettings,
  OnlineOrderPolicy,
  OnlineShippingPolicy,
  OnlineStoreSettings,
  PaymentMethodConfig,
  PaymentMethodId,
  PaymentSettings,
  PrintSettings,
  Register,
  SecuritySettings,
  StoreLocation,
  StoreSettings,
  TaxRate,
  TaxSettings,
  Weekday,
} from "@/types/settings";

export interface SettingsState {
  businessProfile: BusinessProfileSettings;
  store: StoreSettings;
  onlineStore: OnlineStoreSettings;
  invoice: InvoiceSettings;
  tax: TaxSettings;
  payments: PaymentSettings;
  barcode: GlobalBarcodeSettings;
  notifications: NotificationSettings;
  print: PrintSettings;
  backup: BackupSettings;
  security: SecuritySettings;
  locations: StoreLocation[];
}

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

const initialState: SettingsState = {
  businessProfile: {
    businessName: "Funky Kids",
    legalName: "",
    businessType: "Retail",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
    country: "India",
    gstin: "",
    pan: "",
    registrationNumber: "",
    logoUrl: "",
    faviconUrl: "",
    primaryBrandName: "Funky Kids",
  },
  store: {
    storeName: "Funky Kids - Main Store",
    storeCode: "FK001",
    storeType: "Retail Store",
    timezone: "Asia/Kolkata",
    currency: "INR",
    businessHours: (
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as Weekday[]
    ).map((day) => ({ day, open: "10:00", close: "21:00", closed: false })),
    pos: {
      allowWalkInCustomer: true,
      requireCustomerName: true,
      requireContactNumber: true,
      allowCreditSale: true,
      allowNegativeStock: false,
      autoHoldCart: true,
      autoGenerateInvoice: true,
      autoPrintReceipt: false,
    },
    stock: {
      defaultReorderLevel: 10,
      allowStockOverride: false,
      allowNegativeStock: false,
      trackDamagedStock: true,
      trackReservedStock: true,
    },
  },
  onlineStore: {
    info: {
      storeName: "Funky Kids",
      storeUrl: "www.funkykids.example.com",
      storeStatus: "Online",
      currency: "INR",
      language: "English",
    },
    behavior: {
      allowGuestCheckout: true,
      requirePhoneNumber: true,
      requireEmail: true,
      showStockAvailability: true,
      allowOutOfStockProducts: true,
      allowProductReviews: true,
      allowWishlist: true,
    },
    inventory: {
      onlineStockSource: "Main Store",
      reserveStockOn: "Payment Success",
      releaseReservedStockMinutes: 30,
    },
    orders: {
      minimumOrderValue: 500,
      maximumOrderValue: 50000,
      codAvailable: true,
      codMaximum: 10000,
    },
    shipping: {
      freeShippingAbove: 1500,
      defaultShippingFee: 80,
      codFee: 40,
    },
    customer: {
      guestCheckout: true,
      customerAccount: "Optional",
      phoneMandatory: true,
    },
  },
  invoice: {
    sequences: {
      invoices: { prefix: "INV", startingNumber: 1001 },
      quotations: { prefix: "QUO", startingNumber: 1001 },
      estimations: { prefix: "EST", startingNumber: 1001 },
      salesOrders: { prefix: "SO", startingNumber: 1001 },
      purchaseOrders: { prefix: "PO", startingNumber: 1001 },
      creditNotes: { prefix: "CN", startingNumber: 1001 },
      debitNotes: { prefix: "DN", startingNumber: 1001 },
      returns: { prefix: "RET", startingNumber: 1001 },
    },
    style: "Standard",
    showBusinessLogo: true,
    showGstin: true,
    showCustomerName: true,
    showCustomerPhone: true,
    showHsnSac: true,
    showBarcode: true,
    showTaxBreakdown: true,
    showDiscount: true,
    showRoundOff: true,
    showPaymentMethod: true,
    showCashier: true,
    showTermsAndConditions: true,
    thankYouMessage: "Thank you for shopping at Funky Kids!",
  },
  tax: {
    taxSystem: "GST",
    gstin: "",
    registrationType: "Regular",
    state: "Tamil Nadu",
    rates: [
      { id: "exempt", name: "Exempt", ratePercent: 0 },
      { id: "gst5", name: "GST 5%", ratePercent: 5 },
      { id: "gst12", name: "GST 12%", ratePercent: 12 },
      { id: "gst18", name: "GST 18%", ratePercent: 18 },
    ],
    productPriceMode: "Tax Inclusive",
    allowTransactionLevelTaxChoice: true,
    defaultTransactionTaxMode: "Tax Included",
  },
  payments: {
    methods: [
      { id: "cash", label: "Cash", enabled: true, allowInPos: true },
      { id: "upi", label: "UPI", enabled: true, allowInPos: true, upiId: "funkykids@upi", qrCodeUrl: "", paymentGateway: "" },
      { id: "card", label: "Card", enabled: true, allowInPos: true, provider: "", transactionFeePercent: 0 },
      { id: "bankTransfer", label: "Bank Transfer", enabled: true, allowInPos: true },
      { id: "credit", label: "Credit", enabled: true, allowInPos: true, defaultCreditPeriodDays: 30, requireApproval: true },
      { id: "cheque", label: "Cheque", enabled: false, allowInPos: false },
    ],
    allowSplitPayment: true,
  },
  barcode: {
    symbology: "CODE128",
    barcodePrefix: "FK",
    labelWidthMm: 50,
    labelHeightMm: 30,
    labelFields: {
      productName: true,
      price: true,
      size: true,
      color: true,
      barcode: true,
      businessName: true,
    },
    scannerActionPos: "Add to Cart",
    scannerActionGoodsReceived: "Receive Stock",
  },
  notifications: {
    types: {
      lowStock: true,
      outOfStock: true,
      stockAdjustment: true,
      poDeliveryDue: true,
      poOverdue: true,
      supplierPaymentDue: true,
      customerPaymentDue: true,
      newOnlineOrder: true,
      paymentFailed: true,
      refund: true,
      backupCompleted: true,
      backupFailed: true,
      userActivity: true,
    },
    channels: [
      { key: "lowStock", label: "Low Stock", inApp: true, sound: true, email: true },
      { key: "poOverdue", label: "PO Overdue", inApp: true, sound: true, email: true },
      { key: "customerDue", label: "Customer Due", inApp: true, sound: false, email: true },
      { key: "newOrder", label: "New Order", inApp: true, sound: true, email: true },
    ],
    lowStockThreshold: 10,
    criticalStockThreshold: 3,
    paymentReminders: {
      sevenDaysBefore: true,
      threeDaysBefore: true,
      onDueDate: true,
      oneDayOverdue: true,
      sevenDaysOverdue: true,
    },
  },
  print: {
    receiptPrinterName: "",
    paperSize: "80mm",
    autoPrint: true,
    invoicePrinterName: "",
    invoiceCopies: 1,
    receiptConfig: {
      logo: true,
      storeName: true,
      address: true,
      phone: true,
      gstin: true,
      customer: true,
      products: true,
      discount: true,
      tax: true,
      roundOff: true,
      paymentMethod: true,
      cashier: true,
    },
  },
  backup: {
    autoBackupEnabled: true,
    frequency: "Daily",
    time: "02:00",
    keepBackupsDays: 30,
    destination: "Local Server",
    lastBackupAt: "2026-08-28T02:00:00+05:30",
    lastBackupStatus: "Successful",
    databaseSizeMb: 245,
    history: [
      { id: "bk_1", date: "2026-08-28T02:00:00+05:30", sizeMb: 245, type: "Automatic", status: "Successful" },
      { id: "bk_2", date: "2026-08-27T02:00:00+05:30", sizeMb: 242, type: "Automatic", status: "Successful" },
      { id: "bk_3", date: "2026-08-26T02:00:00+05:30", sizeMb: 240, type: "Manual", status: "Successful" },
    ],
  },
  security: {
    sessionTimeoutMinutes: 30,
    maxFailedLoginAttempts: 5,
    require2faForAdmin: true,
    autoLogoutOnIdle: true,
    managerPinRequirements: {
      highDiscount: true,
      priceOverride: true,
      refund: true,
      stockAdjustment: true,
      invoiceCancellation: true,
      supplierPayment: true,
    },
  },
  locations: [
    {
      id: "loc_main",
      name: "Main Store",
      registers: [
        { id: "reg_1", name: "Counter 1", code: "C1", openingCash: 2000, paymentMethods: ["cash", "upi", "card"] },
        { id: "reg_2", name: "Counter 2", code: "C2", openingCash: 2000, paymentMethods: ["cash", "upi"] },
      ],
    },
    {
      id: "loc_warehouse",
      name: "Warehouse",
      registers: [],
    },
  ],
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateBusinessProfile: (state, action: PayloadAction<Partial<BusinessProfileSettings>>) => {
      Object.assign(state.businessProfile, action.payload);
    },
    updateStoreSettings: (
      state,
      action: PayloadAction<Partial<Omit<StoreSettings, "pos" | "stock" | "businessHours">>>,
    ) => {
      Object.assign(state.store, action.payload);
    },
    updatePosSettings: (state, action: PayloadAction<Partial<StoreSettings["pos"]>>) => {
      Object.assign(state.store.pos, action.payload);
    },
    updateStockSettings: (state, action: PayloadAction<Partial<StoreSettings["stock"]>>) => {
      Object.assign(state.store.stock, action.payload);
    },
    updateBusinessHour: (state, action: PayloadAction<{ day: Weekday; changes: Partial<BusinessHoursEntry> }>) => {
      const entry = state.store.businessHours.find((h) => h.day === action.payload.day);
      if (entry) Object.assign(entry, action.payload.changes);
    },
    setBusinessHours: (state, action: PayloadAction<BusinessHoursEntry[]>) => {
      state.store.businessHours = action.payload;
    },
    updateOnlineStoreInfo: (state, action: PayloadAction<Partial<OnlineStoreSettings["info"]>>) => {
      Object.assign(state.onlineStore.info, action.payload);
    },
    updateOnlineStoreBehavior: (state, action: PayloadAction<Partial<OnlineStoreSettings["behavior"]>>) => {
      Object.assign(state.onlineStore.behavior, action.payload);
    },
    updateOnlineInventorySettings: (state, action: PayloadAction<Partial<OnlineInventorySettings>>) => {
      Object.assign(state.onlineStore.inventory, action.payload);
    },
    updateOnlineOrderPolicy: (state, action: PayloadAction<Partial<OnlineOrderPolicy>>) => {
      Object.assign(state.onlineStore.orders, action.payload);
    },
    updateOnlineShippingPolicy: (state, action: PayloadAction<Partial<OnlineShippingPolicy>>) => {
      Object.assign(state.onlineStore.shipping, action.payload);
    },
    updateOnlineCustomerPolicy: (state, action: PayloadAction<Partial<OnlineCustomerPolicy>>) => {
      Object.assign(state.onlineStore.customer, action.payload);
    },
    updateInvoiceSettings: (state, action: PayloadAction<Partial<Omit<InvoiceSettings, "sequences">>>) => {
      Object.assign(state.invoice, action.payload);
    },
    updateInvoiceSequence: (
      state,
      action: PayloadAction<{ docType: keyof InvoiceSettings["sequences"]; changes: Partial<{ prefix: string; startingNumber: number }> }>,
    ) => {
      Object.assign(state.invoice.sequences[action.payload.docType], action.payload.changes);
    },
    updateTaxSettings: (state, action: PayloadAction<Partial<Omit<TaxSettings, "rates">>>) => {
      Object.assign(state.tax, action.payload);
    },
    updateTaxRate: (state, action: PayloadAction<{ id: string; ratePercent: number }>) => {
      const rate = state.tax.rates.find((r) => r.id === action.payload.id);
      if (rate) rate.ratePercent = action.payload.ratePercent;
    },
    addTaxRate: {
      prepare: (input: { name: string; ratePercent: number }) => ({ payload: { id: nextId("tax"), ...input } as TaxRate }),
      reducer: (state, action: PayloadAction<TaxRate>) => {
        state.tax.rates.push(action.payload);
      },
    },
    removeTaxRate: (state, action: PayloadAction<string>) => {
      state.tax.rates = state.tax.rates.filter((r) => r.id !== action.payload);
    },
    updatePaymentMethod: (
      state,
      action: PayloadAction<{ id: PaymentMethodId; changes: Partial<PaymentMethodConfig> }>,
    ) => {
      const method = state.payments.methods.find((m) => m.id === action.payload.id);
      if (method) Object.assign(method, action.payload.changes);
    },
    setAllowSplitPayment: (state, action: PayloadAction<boolean>) => {
      state.payments.allowSplitPayment = action.payload;
    },
    updateBarcodeGlobalSettings: (
      state,
      action: PayloadAction<Partial<Omit<GlobalBarcodeSettings, "labelFields">>>,
    ) => {
      Object.assign(state.barcode, action.payload);
    },
    updateBarcodeLabelFields: (state, action: PayloadAction<Partial<GlobalBarcodeSettings["labelFields"]>>) => {
      Object.assign(state.barcode.labelFields, action.payload);
    },
    toggleNotificationType: (state, action: PayloadAction<keyof NotificationTypeToggles>) => {
      state.notifications.types[action.payload] = !state.notifications.types[action.payload];
    },
    updateNotificationChannel: (
      state,
      action: PayloadAction<{ key: NotificationChannelKey; channel: "inApp" | "sound" | "email"; value: boolean }>,
    ) => {
      const row = state.notifications.channels.find((c) => c.key === action.payload.key);
      if (row) row[action.payload.channel] = action.payload.value;
    },
    updateNotificationThresholds: (
      state,
      action: PayloadAction<Partial<Pick<NotificationSettings, "lowStockThreshold" | "criticalStockThreshold">>>,
    ) => {
      Object.assign(state.notifications, action.payload);
    },
    updatePaymentReminders: (state, action: PayloadAction<Partial<NotificationSettings["paymentReminders"]>>) => {
      Object.assign(state.notifications.paymentReminders, action.payload);
    },
    updatePrintSettings: (state, action: PayloadAction<Partial<Omit<PrintSettings, "receiptConfig">>>) => {
      Object.assign(state.print, action.payload);
    },
    updateReceiptConfig: (state, action: PayloadAction<Partial<PrintSettings["receiptConfig"]>>) => {
      Object.assign(state.print.receiptConfig, action.payload);
    },
    updateBackupSettings: (state, action: PayloadAction<Partial<Omit<BackupSettings, "history">>>) => {
      Object.assign(state.backup, action.payload);
    },
    runManualBackup: {
      prepare: () => ({
        payload: {
          id: nextId("bk"),
          date: new Date().toISOString(),
          sizeMb: 0,
          type: "Manual",
          status: "Successful",
        } as BackupHistoryEntry,
      }),
      reducer: (state, action: PayloadAction<BackupHistoryEntry>) => {
        const entry = { ...action.payload, sizeMb: state.backup.databaseSizeMb };
        state.backup.history.unshift(entry);
        state.backup.lastBackupAt = entry.date;
        state.backup.lastBackupStatus = entry.status;
      },
    },
    updateSecuritySettings: (
      state,
      action: PayloadAction<Partial<Omit<SecuritySettings, "managerPinRequirements">>>,
    ) => {
      Object.assign(state.security, action.payload);
    },
    updateManagerPinRequirements: (state, action: PayloadAction<Partial<ManagerPinRequirements>>) => {
      Object.assign(state.security.managerPinRequirements, action.payload);
    },
    addLocation: {
      prepare: (name: string) => ({ payload: { id: nextId("loc"), name, registers: [] } as StoreLocation }),
      reducer: (state, action: PayloadAction<StoreLocation>) => {
        state.locations.push(action.payload);
      },
    },
    removeLocation: (state, action: PayloadAction<string>) => {
      state.locations = state.locations.filter((loc) => loc.id !== action.payload);
    },
    addRegister: {
      prepare: (input: { locationId: string; name: string; code: string }) => ({
        payload: {
          locationId: input.locationId,
          register: { id: nextId("reg"), name: input.name, code: input.code, openingCash: 0, paymentMethods: [] } as Register,
        },
      }),
      reducer: (state, action: PayloadAction<{ locationId: string; register: Register }>) => {
        const location = state.locations.find((loc) => loc.id === action.payload.locationId);
        location?.registers.push(action.payload.register);
      },
    },
    removeRegister: (state, action: PayloadAction<{ locationId: string; registerId: string }>) => {
      const location = state.locations.find((loc) => loc.id === action.payload.locationId);
      if (location) location.registers = location.registers.filter((r) => r.id !== action.payload.registerId);
    },
  },
});

export const {
  updateBusinessProfile,
  updateStoreSettings,
  updatePosSettings,
  updateStockSettings,
  updateBusinessHour,
  setBusinessHours,
  updateOnlineStoreInfo,
  updateOnlineStoreBehavior,
  updateOnlineInventorySettings,
  updateOnlineOrderPolicy,
  updateOnlineShippingPolicy,
  updateOnlineCustomerPolicy,
  updateInvoiceSettings,
  updateInvoiceSequence,
  updateTaxSettings,
  updateTaxRate,
  addTaxRate,
  removeTaxRate,
  updatePaymentMethod,
  setAllowSplitPayment,
  updateBarcodeGlobalSettings,
  updateBarcodeLabelFields,
  toggleNotificationType,
  updateNotificationChannel,
  updateNotificationThresholds,
  updatePaymentReminders,
  updatePrintSettings,
  updateReceiptConfig,
  updateBackupSettings,
  runManualBackup,
  updateSecuritySettings,
  updateManagerPinRequirements,
  addLocation,
  removeLocation,
  addRegister,
  removeRegister,
} = settingsSlice.actions;

interface RootStateWithSettings {
  settings: SettingsState;
}

export const selectBusinessProfile = (state: RootStateWithSettings) => state.settings.businessProfile;
export const selectStoreSettings = (state: RootStateWithSettings) => state.settings.store;
export const selectOnlineStoreSettings = (state: RootStateWithSettings) => state.settings.onlineStore;
export const selectInvoiceSettings = (state: RootStateWithSettings) => state.settings.invoice;
export const selectTaxSettings = (state: RootStateWithSettings) => state.settings.tax;
export const selectPaymentSettings = (state: RootStateWithSettings) => state.settings.payments;
export const selectBarcodeGlobalSettings = (state: RootStateWithSettings) => state.settings.barcode;
export const selectNotificationSettings = (state: RootStateWithSettings) => state.settings.notifications;
export const selectPrintSettings = (state: RootStateWithSettings) => state.settings.print;
export const selectBackupSettings = (state: RootStateWithSettings) => state.settings.backup;
export const selectSecuritySettings = (state: RootStateWithSettings) => state.settings.security;
export const selectLocations = (state: RootStateWithSettings) => state.settings.locations;

export default settingsSlice.reducer;
