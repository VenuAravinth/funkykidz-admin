import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import catalogReducer from "./slices/catalogSlice";
import stockMovementsReducer from "./slices/stockMovementsSlice";
import stockAdjustmentsReducer from "./slices/stockAdjustmentsSlice";
import barcodeReducer from "./slices/barcodeSlice";
import transfersReducer from "./slices/transfersSlice";
import estimationsReducer from "./slices/estimationsSlice";
import quotationsReducer from "./slices/quotationsSlice";
import salesOrdersReducer from "./slices/salesOrdersSlice";
import invoicesReducer from "./slices/invoicesSlice";
import posReducer from "./slices/posSlice";
import onlineOrdersReducer from "./slices/onlineOrdersSlice";
import onlineStoreReducer from "./slices/onlineStoreSlice";
import returnsReducer from "./slices/returnsSlice";
import customerPaymentsReducer from "./slices/customerPaymentsSlice";
import financeReducer from "./slices/financeSlice";
import customersReducer from "./slices/customersSlice";
import notificationsUiReducer from "./slices/notificationsUiSlice";
import settingsReducer from "./slices/settingsSlice";
import usersReducer from "./slices/usersSlice";
import rolesReducer from "./slices/rolesSlice";
import staffReducer from "./slices/staffSlice";
import activityLogsReducer from "./slices/activityLogsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    stockMovements: stockMovementsReducer,
    stockAdjustments: stockAdjustmentsReducer,
    barcode: barcodeReducer,
    transfers: transfersReducer,
    estimations: estimationsReducer,
    quotations: quotationsReducer,
    salesOrders: salesOrdersReducer,
    invoices: invoicesReducer,
    pos: posReducer,
    onlineOrders: onlineOrdersReducer,
    onlineStore: onlineStoreReducer,
    returns: returnsReducer,
    customerPayments: customerPaymentsReducer,
    finance: financeReducer,
    customers: customersReducer,
    notificationsUi: notificationsUiReducer,
    settings: settingsReducer,
    users: usersReducer,
    roles: rolesReducer,
    staff: staffReducer,
    activityLogs: activityLogsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
