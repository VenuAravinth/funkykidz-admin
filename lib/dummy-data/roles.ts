import type { PermissionGroup, Role } from "@/types/role";

export const PERMISSION_CATALOG: PermissionGroup[] = [
  {
    key: "sales",
    label: "Sales",
    items: [
      { key: "sales.view_sales", label: "View Sales" },
      { key: "sales.create_sale", label: "Create Sale" },
      { key: "sales.edit_sale", label: "Edit Sale" },
      { key: "sales.cancel_sale", label: "Cancel Sale" },
      { key: "sales.create_invoice", label: "Create Invoice" },
      { key: "sales.view_invoice", label: "View Invoice" },
      { key: "sales.print_invoice", label: "Print Invoice" },
      { key: "sales.refund", label: "Refund" },
      { key: "sales.apply_discount", label: "Apply Discount" },
      { key: "sales.override_price", label: "Override Price" },
    ],
  },
  {
    key: "inventory",
    label: "Inventory",
    items: [
      { key: "inventory.view_stock", label: "View Stock" },
      { key: "inventory.create_product", label: "Create Product" },
      { key: "inventory.edit_product", label: "Edit Product" },
      { key: "inventory.delete_product", label: "Delete Product" },
      { key: "inventory.adjust_stock", label: "Adjust Stock" },
      { key: "inventory.transfer_stock", label: "Transfer Stock" },
      { key: "inventory.view_movement", label: "View Movement" },
      { key: "inventory.export_report", label: "Export Report" },
    ],
  },
  {
    key: "purchase",
    label: "Purchase",
    items: [
      { key: "purchase.view_po", label: "View PO" },
      { key: "purchase.create_po", label: "Create PO" },
      { key: "purchase.edit_po", label: "Edit PO" },
      { key: "purchase.approve_po", label: "Approve PO" },
      { key: "purchase.receive_goods", label: "Receive Goods" },
      { key: "purchase.purchase_return", label: "Purchase Return" },
      { key: "purchase.supplier_payment", label: "Supplier Payment" },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    items: [
      { key: "finance.view_finance", label: "View Finance" },
      { key: "finance.view_transactions", label: "View Transactions" },
      { key: "finance.create_expense", label: "Create Expense" },
      { key: "finance.edit_expense", label: "Edit Expense" },
      { key: "finance.delete_expense", label: "Delete Expense" },
      { key: "finance.receive_customer_payment", label: "Receive Customer Payment" },
      { key: "finance.make_supplier_payment", label: "Make Supplier Payment" },
      { key: "finance.view_pl", label: "View P&L" },
      { key: "finance.export_reports", label: "Export Reports" },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.flatMap((group) => group.items.map((item) => item.key));

function keysExcept(...exclude: string[]): string[] {
  const excluded = new Set(exclude);
  return ALL_PERMISSION_KEYS.filter((key) => !excluded.has(key));
}

function keysFor(prefixes: string[]): string[] {
  return ALL_PERMISSION_KEYS.filter((key) => prefixes.some((prefix) => key.startsWith(prefix)));
}

export const roles: Role[] = [
  {
    id: "role_administrator",
    name: "Administrator",
    description: "Full system access across every module.",
    permissionKeys: ALL_PERMISSION_KEYS,
    status: "active",
    createdDate: "2022-01-01",
  },
  {
    id: "role_owner",
    name: "Owner / Super Admin",
    description: "Business owner with unrestricted access.",
    permissionKeys: ALL_PERMISSION_KEYS,
    status: "active",
    createdDate: "2022-01-01",
  },
  {
    id: "role_manager",
    name: "Manager",
    description: "Oversees daily operations across sales, inventory, and purchase.",
    permissionKeys: keysExcept(
      "inventory.delete_product",
      "finance.delete_expense",
      "sales.override_price",
    ),
    status: "active",
    createdDate: "2022-02-15",
  },
  {
    id: "role_sales_manager",
    name: "Sales Manager",
    description: "Manages the sales team, discounts, and refunds.",
    permissionKeys: [
      ...keysFor(["sales."]),
      "inventory.view_stock",
      "finance.view_transactions",
    ],
    status: "active",
    createdDate: "2022-03-01",
  },
  {
    id: "role_cashier",
    name: "Cashier",
    description: "Handles POS billing and customer payments.",
    permissionKeys: [
      "sales.view_sales",
      "sales.create_sale",
      "sales.create_invoice",
      "sales.view_invoice",
      "sales.print_invoice",
      "inventory.view_stock",
    ],
    status: "active",
    createdDate: "2022-03-10",
  },
  {
    id: "role_inventory_staff",
    name: "Inventory Staff",
    description: "Manages stock levels, transfers, and product records.",
    permissionKeys: [
      ...keysFor(["inventory."]),
      "purchase.view_po",
      "purchase.receive_goods",
    ],
    status: "active",
    createdDate: "2022-04-05",
  },
  {
    id: "role_purchase_staff",
    name: "Purchase Staff",
    description: "Creates and tracks purchase orders with suppliers.",
    permissionKeys: [
      ...keysFor(["purchase."]),
      "inventory.view_stock",
      "inventory.adjust_stock",
    ],
    status: "active",
    createdDate: "2022-04-20",
  },
  {
    id: "role_accountant",
    name: "Accountant",
    description: "Manages expenses, payments, and financial reporting.",
    permissionKeys: keysFor(["finance."]),
    status: "active",
    createdDate: "2022-05-01",
  },
  {
    id: "role_online_order_staff",
    name: "Online Order Staff",
    description: "Processes online orders and customer invoices.",
    permissionKeys: [
      "sales.view_sales",
      "sales.create_sale",
      "sales.create_invoice",
      "sales.view_invoice",
      "sales.print_invoice",
      "inventory.view_stock",
      "purchase.view_po",
    ],
    status: "active",
    createdDate: "2022-06-01",
  },
];
