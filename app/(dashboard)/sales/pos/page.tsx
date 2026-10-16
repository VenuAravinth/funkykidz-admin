"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  HiOutlineMagnifyingGlass,
  HiOutlinePause,
  HiOutlineTrash,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineTicket,
  HiOutlinePlusCircle,
  HiOutlineTag,
  HiOutlinePrinter,
  HiOutlineXMark,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Modal } from "@/components/molecules/Modal";
import { formatCurrency, formatDate } from "@/lib/format";
import { buildStockRows, applyReservedStock, type StockRow } from "@/lib/stockRows";
import { buildCustomerSummaries, resolveCustomerCreditLimit, type CustomerSummary } from "@/lib/customers";
import { invoiceSubtotal, invoiceGstAmount, invoiceGrandTotal, invoiceBalance } from "@/lib/dummy-data/invoices";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectProducts } from "@/stores/slices/catalogSlice";
import { adjustProductStock } from "@/features/products/api";
import { addMovement } from "@/stores/slices/stockMovementsSlice";
import { selectAuthUser } from "@/stores/slices/authSlice";
import { addInvoice, selectInvoices, selectInvoiceById } from "@/stores/slices/invoicesSlice";
import { selectCustomerByName } from "@/stores/slices/customersSlice";
import {
  selectTabs,
  selectActiveTab,
  DEFAULT_CUSTOMER,
  addCartItem,
  incrementCartItem,
  decrementCartItem,
  removeCartItem,
  setCustomerDetails,
  setBillDiscount,
  updateCartItemDiscount,
  setGstPercent,
  setTaxIncluded,
  applyCoupon,
  clearCoupon,
  newSaleTab,
  switchTab,
  holdActiveTab,
  cancelTab,
  closeTabAfterSale,
} from "@/stores/slices/posSlice";
import { PAYMENT_METHODS, type CartLineItem, type PaymentMethodValue } from "@/types/pos";

const COUPONS: Record<string, number> = { WELCOME10: 10, FEST20: 20, VIP15: 15 };
const dashed = "border-t border-dashed border-ink/25";

function lineDiscountAmount(item: CartLineItem): number {
  const gross = item.price * item.quantity;
  return item.discountType === "percent" ? Math.round(gross * (item.discountValue / 100)) : Math.min(gross, item.discountValue);
}

function lineTotal(item: CartLineItem): number {
  return item.price * item.quantity - lineDiscountAmount(item);
}

function SaleTabBar({
  tabs,
  activeTabId,
  onSwitch,
  onCancel,
  onNew,
}: {
  tabs: ReturnType<typeof selectTabs>;
  activeTabId: string;
  onSwitch: (id: string) => void;
  onCancel: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const total = tab.items.reduce((sum, item) => sum + lineTotal(item), 0);
        const active = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSwitch(tab.id)}
            className={cn(
              "group flex items-center gap-2.5 rounded-full border py-2 pl-4 pr-2 text-base transition-colors",
              active
                ? "border-champagne-400 bg-champagne-100/70 text-champagne-800"
                : "border-glass-border bg-white/50 text-ink-muted hover:bg-white/90",
            )}
          >
            <span className="font-semibold">Sale #{String(tab.number).padStart(3, "0")}</span>
            <span className="text-sm">
              {tab.customerName} &middot; {formatCurrency(total)}
            </span>
            {tab.status === "held" && (
              <Badge tone="warning" className="ml-0.5">
                Held
              </Badge>
            )}
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onCancel(tab.id);
              }}
              className="ml-0.5 rounded-full p-1 text-ink-muted opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              aria-label={`Cancel sale #${tab.number}`}
            >
              <HiOutlineTrash className="h-4 w-4" />
            </span>
          </button>
        );
      })}
      <Button variant="ghost" onClick={onNew}>
        <HiOutlinePlusCircle className="h-5 w-5" />
        New Sale
      </Button>
    </div>
  );
}

function ProductCombobox({ rows, onAdd }: { rows: StockRow[]; onAdd: (row: StockRow) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows.slice(0, 8);
    return rows
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.barcode === query.trim() ||
          r.size.toLowerCase().includes(q) ||
          r.color.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [rows, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const select = (row: StockRow) => {
    if (row.available <= 0) return;
    onAdd(row);
    setQuery("");
    setError(null);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    const code = query.trim();
    if (!code) return;
    const match = rows.find((r) => r.barcode === code);
    if (!match) {
      setError(`No product found for "${code}".`);
      return;
    }
    if (match.available <= 0) {
      setError(`${match.name} is out of stock.`);
      return;
    }
    select(match);
  };

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="relative">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          <Input
            ref={inputRef}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            placeholder="Scan barcode or search a product…"
            className="h-14 pl-12 text-lg"
          />
        </div>
      </form>

      {error && <p className="mt-1.5 text-sm font-medium text-red-500">{error}</p>}

      {open && (
        <div className="absolute z-20 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-glass-border bg-white shadow-xl">
          {filtered.length === 0 && <p className="p-4 text-center text-base text-ink-muted">No products match.</p>}
          {filtered.map((row) => {
            const outOfStock = row.available <= 0;
            return (
              <button
                key={row.key}
                type="button"
                disabled={outOfStock}
                onClick={() => select(row)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 border-b border-glass-border/60 px-4 py-3 text-left last:border-0",
                  outOfStock ? "cursor-not-allowed opacity-50" : "hover:bg-champagne-50",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-ink">{row.name}</p>
                  <p className="text-sm text-ink-muted">
                    {row.color} · {row.size}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-base font-semibold text-champagne-700">{formatCurrency(row.price)}</span>
                  <Badge tone={outOfStock ? "danger" : row.available <= row.minStock ? "warning" : "neutral"}>
                    {outOfStock ? "Out of stock" : row.tracked ? `${row.available} left` : "In stock"}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomerCombobox({
  customerName,
  customerPhone,
  isWalkIn,
  summaries,
  onSelect,
}: {
  customerName: string;
  customerPhone: string;
  isWalkIn: boolean;
  summaries: CustomerSummary[];
  onSelect: (input: { name: string; phone: string; isWalkIn: boolean }) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [addErrors, setAddErrors] = useState<{ name?: string; phone?: string }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return summaries.slice(0, 8);
    return summaries.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 8);
  }, [summaries, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeSummary = !isWalkIn ? summaries.find((c) => c.name === customerName) : undefined;

  const selectWalkIn = () => {
    onSelect({ name: DEFAULT_CUSTOMER, phone: "", isWalkIn: true });
    setQuery("");
    setOpen(false);
  };

  const selectExisting = (c: CustomerSummary) => {
    onSelect({ name: c.name, phone: c.phone === "—" ? "" : c.phone, isWalkIn: false });
    setQuery("");
    setOpen(false);
  };

  const submitNewCustomer = () => {
    const name = newName.trim();
    const phoneDigits = newPhone.replace(/\D/g, "");
    const errors: typeof addErrors = {};
    if (name.length < 2) errors.name = "Enter the customer's name.";
    if (phoneDigits.length < 10) errors.phone = "Enter a valid 10-digit phone number.";
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    onSelect({ name, phone: newPhone.trim(), isWalkIn: false });
    setNewName("");
    setNewPhone("");
    setAddErrors({});
    setAddOpen(false);
    setOpen(false);
  };

  return (
    <div>
      <div ref={containerRef} className="relative">
        <Input
          value={open ? query : customerName}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search customer by name or phone…"
          className="h-12 text-base"
        />
        {open && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-glass-border bg-white shadow-xl">
            <button
              type="button"
              onClick={selectWalkIn}
              className="block w-full px-4 py-3 text-left text-base font-medium text-ink hover:bg-champagne-50"
            >
              Walk-in Customer
            </button>
            <div className="max-h-64 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => selectExisting(c)}
                  className="flex w-full flex-col gap-0.5 border-t border-glass-border/60 px-4 py-3 text-left hover:bg-champagne-50"
                >
                  <span className="flex items-center justify-between text-base font-medium text-ink">
                    <span>{c.name}</span>
                    <span className="text-sm text-ink-muted">{c.phone}</span>
                  </span>
                  <span className="text-sm text-ink-muted">
                    {c.totalOrders} order{c.totalOrders === 1 ? "" : "s"} &middot; {formatCurrency(c.totalPurchases)} purchased
                    {c.outstanding > 0 && <span className="text-red-600"> &middot; {formatCurrency(c.outstanding)} due</span>}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex w-full items-center gap-2 border-t border-glass-border bg-champagne-50/60 px-4 py-3 text-left text-base font-medium text-champagne-700 hover:bg-champagne-100"
            >
              <HiOutlinePlusCircle className="h-5 w-5" />
              Add New Customer
            </button>
          </div>
        )}
      </div>

      {!isWalkIn && activeSummary && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-champagne-50/60 px-3 py-2 text-sm text-ink-muted">
          {customerPhone && <span>{customerPhone}</span>}
          <span>{activeSummary.totalOrders} previous orders</span>
          <span>{formatCurrency(activeSummary.totalPurchases)} total purchase</span>
          {activeSummary.outstanding > 0 && (
            <span className="font-medium text-red-600">{formatCurrency(activeSummary.outstanding)} outstanding</span>
          )}
        </div>
      )}

      <Modal open={addOpen} title="Add New Customer" onClose={() => setAddOpen(false)}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">Name *</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              hasError={!!addErrors.name}
              className="h-11 text-base"
              placeholder="Customer name"
            />
            {addErrors.name && <p className="mt-1 text-sm text-red-500">{addErrors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">Contact Number *</label>
            <Input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              hasError={!!addErrors.phone}
              className="h-11 text-base"
              placeholder="10-digit mobile number"
            />
            {addErrors.phone && <p className="mt-1 text-sm text-red-500">{addErrors.phone}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitNewCustomer}>
              Save Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ReceiptOverlay({
  invoiceId,
  cashInfo,
  onClose,
}: {
  invoiceId: string;
  cashInfo?: { received: number; change: number };
  onClose: () => void;
}) {
  const invoice = useAppSelector(selectInvoiceById(invoiceId));
  if (!invoice) return null;

  const subtotal = invoiceSubtotal(invoice);
  const gstAmount = invoiceGstAmount(invoice);
  const grandTotal = invoiceGrandTotal(invoice);
  const balance = invoiceBalance(invoice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="no-print absolute right-6 top-6">
        <IconButton label="Close" onClick={onClose} className="bg-white">
          <HiOutlineXMark className="h-5 w-5" />
        </IconButton>
      </div>
      <div className="print-area flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="no-print flex items-center gap-2 border-b border-glass-border px-6 py-4 text-champagne-700">
          <span className="text-lg font-semibold">✓ Sale Completed</span>
        </div>
        <Card className="rounded-none p-6 font-mono text-sm text-ink shadow-none">
          <p className="text-center text-lg font-semibold tracking-[0.2em]">FUNKY KIDS</p>
          <div className={cn(dashed, "my-3")} />

          <p>
            Invoice: <span className="font-semibold">{invoice.invoiceNumber}</span>
          </p>
          <p>Date: {formatDate(invoice.createdDate)}</p>

          <p className="mt-4 text-ink-muted">Customer:</p>
          <p className="font-semibold">{invoice.customerName}</p>
          {invoice.customerPhone && <p>{invoice.customerPhone}</p>}

          <div className={cn(dashed, "my-3")} />

          <div className="grid grid-cols-[2fr_0.6fr_1fr_1fr] gap-1 text-xs font-semibold text-ink-muted">
            <span>Product</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Total</span>
          </div>
          <div className={cn(dashed, "my-1")} />
          {invoice.items.map((item) => (
            <div key={item.id} className="grid grid-cols-[2fr_0.6fr_1fr_1fr] gap-1 py-0.5">
              <span className="truncate">{item.product}</span>
              <span className="text-right">{item.quantity}</span>
              <span className="text-right">{formatCurrency(item.rate)}</span>
              <span className="text-right">{formatCurrency(item.quantity * item.rate)}</span>
            </div>
          ))}

          <div className={cn(dashed, "my-3")} />

          <div className="flex justify-between py-0.5">
            <span className="text-ink-muted">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-ink-muted">Discount</span>
            <span>{formatCurrency(invoice.discountAmount)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-ink-muted">GST ({invoice.gstPercent}%)</span>
            <span>{formatCurrency(gstAmount)}</span>
          </div>

          <div className={cn(dashed, "my-3")} />

          <div className="flex justify-between py-0.5 text-base font-semibold text-champagne-700">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-ink-muted">Paid</span>
            <span>{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between py-0.5 font-semibold">
            <span>Balance</span>
            <span className={balance > 0 ? "text-red-600" : "text-emerald-600"}>{formatCurrency(balance)}</span>
          </div>
          {invoice.paymentMethod && (
            <div className="flex justify-between py-0.5 text-xs text-ink-muted">
              <span>Payment</span>
              <span>{invoice.paymentMethod}</span>
            </div>
          )}
          {cashInfo && (
            <>
              <div className="flex justify-between py-0.5 text-xs text-ink-muted">
                <span>Cash Received</span>
                <span>{formatCurrency(cashInfo.received)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-xs text-ink-muted">
                <span>Change</span>
                <span>{formatCurrency(cashInfo.change)}</span>
              </div>
            </>
          )}

          {invoice.notes && (
            <>
              <div className={cn(dashed, "my-3")} />
              <p className="text-xs text-ink-muted">{invoice.notes}</p>
            </>
          )}
        </Card>
        <div className="no-print flex items-center justify-between gap-3 border-t border-glass-border p-4">
          <Link href={`/sales/invoices/${invoice.id}`} className="text-sm font-medium text-champagne-600 hover:text-champagne-700">
            View full invoice →
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              New Sale
            </Button>
            <Button onClick={() => window.print()}>
              <HiOutlinePrinter className="h-4 w-4" />
              Print Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PosPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const authUser = useAppSelector(selectAuthUser);
  const invoices = useAppSelector(selectInvoices);
  const tabs = useAppSelector(selectTabs);
  const activeTab = useAppSelector(selectActiveTab);
  const activeCustomer = useAppSelector((state) => selectCustomerByName(state, activeTab?.customerName ?? ""));

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountEditorKey, setDiscountEditorKey] = useState<string | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [creditOverride, setCreditOverride] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<Record<PaymentMethodValue, number>>({
    cash: 0,
    upi: 0,
    card: 0,
    bank_transfer: 0,
    credit: 0,
  });
  const [completedSale, setCompletedSale] = useState<{ invoiceId: string; cash?: { received: number; change: number } } | null>(null);

  const rows = useMemo(() => {
    const sellable = buildStockRows(products).map((r) => (r.tracked ? r : { ...r, available: Number.MAX_SAFE_INTEGER }));
    return applyReservedStock(sellable, products);
  }, [products]);

  const customerSummaries = useMemo(() => buildCustomerSummaries(invoices), [invoices]);

  if (!activeTab) return null;

  const addRowToCart = (row: StockRow) => {
    if (row.available <= 0) return;
    dispatch(
      addCartItem({
        key: row.key,
        productId: row.productId,
        variantId: row.variantId,
        barcode: row.barcode,
        name: `${row.name} (${row.color} · ${row.size})`,
        price: row.price,
        availableStock: row.available,
      }),
    );
  };

  const grossSubtotal = activeTab.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemDiscountTotal = activeTab.items.reduce((sum, item) => sum + lineDiscountAmount(item), 0);
  const afterItemDiscount = grossSubtotal - itemDiscountTotal;
  const billDiscountAmount =
    activeTab.billDiscountType === "percent"
      ? Math.round(afterItemDiscount * (activeTab.billDiscountValue / 100))
      : Math.min(afterItemDiscount, activeTab.billDiscountValue);
  const taxable = afterItemDiscount - billDiscountAmount;
  const taxIncluded = activeTab.taxMode === "inclusive";
  const gstAmount = taxIncluded
    ? Math.round(taxable - taxable / (1 + activeTab.gstPercent / 100))
    : Math.round(taxable * (activeTab.gstPercent / 100));
  const grandTotal = taxIncluded ? taxable : taxable + gstAmount;
  const itemCount = activeTab.items.reduce((sum, item) => sum + item.quantity, 0);

  const cashChange = (Number(cashReceived) || 0) - grandTotal;
  const creditSummary = !activeTab.isWalkIn ? customerSummaries.find((c) => c.name === activeTab.customerName) : undefined;
  const creditOutstandingBefore = creditSummary?.outstanding ?? 0;
  const creditLimit = resolveCustomerCreditLimit(activeCustomer, activeTab.customerName);
  const newOutstanding = creditOutstandingBefore + grandTotal;

  const splitTotal = Object.values(splitAmounts).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const splitRemaining = grandTotal - splitTotal;

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const percent = COUPONS[code];
    if (!percent) {
      setCouponError(`"${couponInput}" isn't a valid coupon.`);
      return;
    }
    dispatch(applyCoupon({ code, percent }));
    setCouponError(null);
    setCouponInput("");
  };

  const finalizeSale = async (paymentLabel: string, cashInfo?: { received: number; change: number }) => {
    if (!activeTab || activeTab.items.length === 0) return;

    for (const item of activeTab.items) {
      const live = rows.find((r) => r.key === item.key);
      if (!live || live.available < item.quantity) {
        setCheckoutError(`Not enough stock for ${item.name} — only ${live?.available ?? 0} left.`);
        return;
      }
    }

    const byProduct = new Map<string, { variantId: string; delta: number }[]>();
    for (const item of activeTab.items) {
      const live = rows.find((r) => r.key === item.key);
      if (!live?.tracked || !item.variantId) continue;
      byProduct.set(item.productId, [...(byProduct.get(item.productId) ?? []), { variantId: item.variantId, delta: -item.quantity }]);
    }
    try {
      for (const [id, adjustments] of byProduct) {
        await dispatch(adjustProductStock({ id, input: { reason: "manual", note: "POS sale", adjustments } })).unwrap();
      }
    } catch (err) {
      setCheckoutError(typeof err === "string" ? err : "Couldn't update stock for this sale.");
      return;
    }

    const notes =
      [activeTab.couponCode ? `Coupon applied: ${activeTab.couponCode}` : null, taxIncluded ? "Tax included in price" : null]
        .filter(Boolean)
        .join(" · ") || undefined;

    const action = dispatch(
      addInvoice({
        customerName: activeTab.customerName,
        customerPhone: activeTab.customerPhone,
        discountAmount: itemDiscountTotal + billDiscountAmount,
        gstPercent: taxIncluded ? 0 : activeTab.gstPercent,
        paidAmount: grandTotal,
        notes,
        items: activeTab.items.map((i) => ({ product: i.name, quantity: i.quantity, rate: i.price })),
        paymentMethod: paymentLabel,
        salesperson: authUser?.name ?? "Demo User",
        status: "paid",
      }),
    );
    const invoiceId = action.payload.id;

    for (const item of activeTab.items) {
      const live = rows.find((r) => r.key === item.key)!;
      if (!live.tracked) continue;
      const newStock = live.available - item.quantity;
      dispatch(
        addMovement({
          productId: item.productId,
          barcode: item.barcode,
          date: new Date().toISOString().slice(0, 10),
          type: "Sale",
          reference: `POS-${invoiceId}`,
          quantity: -item.quantity,
          balanceBefore: live.available,
          balanceAfter: newStock,
          performedBy: authUser?.name ?? "Demo User",
          reason: "POS sale",
        }),
      );
    }

    dispatch(closeTabAfterSale({ id: activeTab.id }));
    setCompletedSale({ invoiceId, cash: cashInfo });
    setCheckoutOpen(false);
    setSplitOpen(false);
    setPaymentMethod("cash");
    setCashReceived("");
    setCreditOverride(false);
    setCheckoutError(null);
  };

  const handleCheckoutComplete = () => {
    setCheckoutError(null);
    if (paymentMethod === "cash") {
      const received = Number(cashReceived) || 0;
      if (received < grandTotal) {
        setCheckoutError("Cash received is less than the amount payable.");
        return;
      }
      void finalizeSale("Cash", { received, change: received - grandTotal });
      return;
    }
    if (paymentMethod === "credit") {
      if (activeTab.isWalkIn) {
        setCheckoutError("Select a customer for a credit sale.");
        return;
      }
      if (newOutstanding > creditLimit && !creditOverride) {
        setCheckoutError("This exceeds the customer's credit limit — check the manager override to continue.");
        return;
      }
      void finalizeSale("Credit");
      return;
    }
    const label = PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ?? paymentMethod;
    void finalizeSale(label);
  };

  const handleSplitComplete = () => {
    if (splitRemaining !== 0) return;
    const parts = PAYMENT_METHODS.filter((m) => splitAmounts[m.value] > 0).map((m) => `${m.label} ${formatCurrency(splitAmounts[m.value])}`);
    void finalizeSale(`Split: ${parts.join(" + ")}`);
    setSplitAmounts({ cash: 0, upi: 0, card: 0, bank_transfer: 0, credit: 0 });
  };

  return (
    <div>
      <PageHeader
        title="POS / Billing"
        subtitle="Scan, search, and check out — the fastest screen in the ERP."
        actions={
          <>
            <Button variant="secondary" disabled={activeTab.items.length === 0} onClick={() => dispatch(holdActiveTab())}>
              <HiOutlinePause className="h-4 w-4" />
              Hold Sale
            </Button>
          </>
        }
      />

      <SaleTabBar
        tabs={tabs}
        activeTabId={activeTab.id}
        onSwitch={(id) => dispatch(switchTab({ id }))}
        onCancel={(id) => dispatch(cancelTab({ id }))}
        onNew={() => dispatch(newSaleTab())}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_440px]">
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-lg font-semibold text-ink">Add Products</h2>
          <ProductCombobox rows={rows} onAdd={addRowToCart} />
          <p className="text-sm text-ink-muted">Search by product name, colour or size — or scan a barcode and press Enter.</p>
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">Customer</label>
            <CustomerCombobox
              customerName={activeTab.customerName}
              customerPhone={activeTab.customerPhone}
              isWalkIn={activeTab.isWalkIn}
              summaries={customerSummaries}
              onSelect={(input) => dispatch(setCustomerDetails(input))}
            />
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-ink">Cart</h2>
            {activeTab.items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-glass-border py-8 text-center text-base text-ink-muted">
                Scan or search a product to add it.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-glass-border">
                {activeTab.items.map((item) => {
                  const itemDiscount = lineDiscountAmount(item);
                  return (
                    <li key={item.key} className="flex flex-col gap-2 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-medium text-ink">{item.name}</p>
                          <p className="text-sm text-ink-muted">{formatCurrency(item.price)} each</p>
                        </div>
                        <IconButton
                          label="Remove item"
                          onClick={() => dispatch(removeCartItem({ key: item.key }))}
                          className="shrink-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </IconButton>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <IconButton label="Decrease quantity" onClick={() => dispatch(decrementCartItem({ key: item.key }))} className="border border-glass-border bg-white/60">
                            <HiOutlineMinus className="h-4 w-4" />
                          </IconButton>
                          <span className="w-6 text-center text-base font-medium text-ink">{item.quantity}</span>
                          <IconButton
                            label="Increase quantity"
                            disabled={item.quantity >= item.availableStock}
                            onClick={() => dispatch(incrementCartItem({ key: item.key }))}
                            className="border border-glass-border bg-white/60"
                          >
                            <HiOutlinePlus className="h-4 w-4" />
                          </IconButton>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDiscountEditorKey(discountEditorKey === item.key ? null : item.key)}
                          className={cn(
                            "flex items-center gap-1 rounded-full px-2.5 py-1 text-sm",
                            itemDiscount > 0 ? "bg-champagne-100 text-champagne-700" : "text-ink-muted hover:bg-champagne-50",
                          )}
                        >
                          <HiOutlineTag className="h-3.5 w-3.5" />
                          Discount
                        </button>
                        <div className="text-right">
                          {itemDiscount > 0 && (
                            <p className="text-xs text-ink-muted line-through">{formatCurrency(item.price * item.quantity)}</p>
                          )}
                          <p className="text-base font-semibold text-ink">{formatCurrency(lineTotal(item))}</p>
                        </div>
                      </div>
                      {discountEditorKey === item.key && (
                        <div className="flex items-center gap-2 rounded-lg bg-champagne-50/60 px-3 py-2">
                          <span className="text-sm text-ink-muted">Discount</span>
                          <div className="flex h-9 shrink-0 overflow-hidden rounded-lg border border-glass-border">
                            <button
                              type="button"
                              onClick={() => dispatch(updateCartItemDiscount({ key: item.key, discountType: "amount", discountValue: item.discountValue }))}
                              className={cn(
                                "h-full px-3 text-sm font-medium",
                                item.discountType === "amount" ? "bg-champagne-500 text-white" : "bg-white text-ink-muted",
                              )}
                            >
                              ₹
                            </button>
                            <button
                              type="button"
                              onClick={() => dispatch(updateCartItemDiscount({ key: item.key, discountType: "percent", discountValue: item.discountValue }))}
                              className={cn(
                                "h-full px-3 text-sm font-medium",
                                item.discountType === "percent" ? "bg-champagne-500 text-white" : "bg-white text-ink-muted",
                              )}
                            >
                              %
                            </button>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            className="h-9 min-w-0 flex-1 text-base"
                            value={item.discountValue || ""}
                            onChange={(e) =>
                              dispatch(
                                updateCartItemDiscount({ key: item.key, discountType: item.discountType, discountValue: Number(e.target.value) || 0 }),
                              )
                            }
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-muted">Bill Discount</label>
              <div className="flex gap-2">
                <div className="flex h-11 shrink-0 overflow-hidden rounded-xl border border-glass-border">
                  <button
                    type="button"
                    onClick={() => dispatch(setBillDiscount({ type: "amount", value: activeTab.billDiscountValue }))}
                    className={cn(
                      "h-full px-3 text-base font-medium",
                      activeTab.billDiscountType === "amount" ? "bg-champagne-500 text-white" : "bg-white text-ink-muted",
                    )}
                  >
                    ₹
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(setBillDiscount({ type: "percent", value: activeTab.billDiscountValue }))}
                    className={cn(
                      "h-full px-3 text-base font-medium",
                      activeTab.billDiscountType === "percent" ? "bg-champagne-500 text-white" : "bg-white text-ink-muted",
                    )}
                  >
                    %
                  </button>
                </div>
                <Input
                  type="number"
                  min={0}
                  className="h-11 min-w-0 flex-1 text-base"
                  value={activeTab.billDiscountValue || ""}
                  onChange={(e) => dispatch(setBillDiscount({ type: activeTab.billDiscountType, value: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <label htmlFor="pos-gst" className="mb-1.5 block text-sm font-medium text-ink-muted">
                GST %
              </label>
              <Input
                id="pos-gst"
                type="number"
                min={0}
                max={100}
                className="h-11 text-base"
                value={activeTab.gstPercent}
                onChange={(e) => dispatch(setGstPercent(Number(e.target.value) || 0))}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-base text-ink">
            <Checkbox checked={taxIncluded} onChange={(e) => dispatch(setTaxIncluded(e.target.checked))} />
            Tax Included in Price
          </label>

          <div>
            <label htmlFor="pos-coupon" className="mb-1.5 block text-sm font-medium text-ink-muted">
              Coupon
            </label>
            {activeTab.couponCode ? (
              <div className="flex items-center justify-between rounded-xl border border-champagne-300 bg-champagne-100/60 px-3 py-2 text-base">
                <span className="flex items-center gap-1.5 font-medium text-champagne-700">
                  <HiOutlineTicket className="h-4 w-4" />
                  {activeTab.couponCode} applied
                </span>
                <button type="button" onClick={() => dispatch(clearCoupon())} className="text-sm text-ink-muted hover:text-ink">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="pos-coupon"
                  placeholder="Coupon code"
                  className="h-11 text-base"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={handleApplyCoupon}>
                  Apply
                </Button>
              </div>
            )}
            {couponError && <p className="mt-1 text-sm font-medium text-red-500">{couponError}</p>}
          </div>

          <div className="rounded-xl border border-glass-border bg-white/50 p-4 text-base">
            <div className="flex justify-between py-1">
              <span className="text-ink-muted">Items</span>
              <span className="font-medium text-ink">{itemCount}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-muted">Subtotal</span>
              <span className="font-medium text-ink">{formatCurrency(grossSubtotal)}</span>
            </div>
            {itemDiscountTotal > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Item Discount</span>
                <span className="font-medium text-ink">-{formatCurrency(itemDiscountTotal)}</span>
              </div>
            )}
            {billDiscountAmount > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Bill Discount</span>
                <span className="font-medium text-ink">-{formatCurrency(billDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-ink-muted">Taxable Amount</span>
              <span className="font-medium text-ink">{formatCurrency(taxable)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-muted">
                GST ({activeTab.gstPercent}%){taxIncluded && " · incl."}
              </span>
              <span className="font-medium text-ink">{formatCurrency(gstAmount)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-glass-border pt-2">
              <span className="text-lg font-semibold text-ink">Total</span>
              <span className="text-2xl font-bold text-champagne-700">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <Button
            size="lg"
            fullWidth
            disabled={activeTab.items.length === 0}
            onClick={() => setCheckoutOpen(true)}
            className="h-14 text-xl font-bold"
          >
            PAY {formatCurrency(grandTotal)}
          </Button>
        </Card>
      </div>

      <Modal
        open={checkoutOpen}
        title="Checkout"
        subtitle={`Sale #${String(activeTab.number).padStart(3, "0")} · ${activeTab.customerName}`}
        onClose={() => setCheckoutOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-champagne-50/60 px-4 py-3 text-center">
            <p className="text-sm text-ink-muted">Amount Payable</p>
            <p className="text-3xl font-bold text-champagne-700">{formatCurrency(grandTotal)}</p>
          </div>

          {!splitOpen ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.value);
                      setCheckoutError(null);
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-base font-semibold transition-colors",
                      paymentMethod === m.value
                        ? "border-champagne-500 bg-champagne-500 text-white"
                        : "border-glass-border bg-white/60 text-ink hover:bg-white",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSplitOpen(true)}
                  className="col-span-2 rounded-xl border border-dashed border-glass-border px-4 py-3 text-base font-medium text-ink-muted hover:bg-white/60"
                >
                  Split across multiple methods
                </button>
              </div>

              {paymentMethod === "cash" && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink-muted">Cash Received</label>
                  <Input
                    type="number"
                    min={0}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="h-12 text-lg"
                    placeholder={String(grandTotal)}
                  />
                  <div className="flex justify-between text-base">
                    <span className="text-ink-muted">Change</span>
                    <span className={cn("font-semibold", cashChange >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {formatCurrency(Math.max(cashChange, 0))}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === "credit" && (
                <div className="flex flex-col gap-2 rounded-xl bg-white/60 p-3 text-sm">
                  {activeTab.isWalkIn ? (
                    <p className="text-red-600">Credit sales need a named customer — select or add one above.</p>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Outstanding before</span>
                        <span>{formatCurrency(creditOutstandingBefore)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">This sale</span>
                        <span>{formatCurrency(grandTotal)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>New outstanding</span>
                        <span className={newOutstanding > creditLimit ? "text-red-600" : "text-ink"}>{formatCurrency(newOutstanding)}</span>
                      </div>
                      <div className="flex justify-between text-ink-muted">
                        <span>Credit limit</span>
                        <span>{formatCurrency(creditLimit)}</span>
                      </div>
                      {newOutstanding > creditLimit && (
                        <label className="mt-1 flex items-center gap-2 text-red-600">
                          <Checkbox checked={creditOverride} onChange={(e) => setCreditOverride(e.target.checked)} />
                          Manager override — exceeds credit limit
                        </label>
                      )}
                    </>
                  )}
                </div>
              )}

              {checkoutError && <p className="text-sm font-medium text-red-500">{checkoutError}</p>}

              <Button size="lg" fullWidth className="h-14 text-lg font-bold" onClick={handleCheckoutComplete}>
                Complete Sale & Print
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 rounded-xl border border-glass-border bg-white/50 p-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Split Payment</p>
              {PAYMENT_METHODS.map((m) => (
                <div key={m.value} className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-base text-ink">{m.label}</span>
                  <Input
                    type="number"
                    min={0}
                    className="h-10 max-w-32 text-base"
                    value={splitAmounts[m.value] || ""}
                    onChange={(e) => setSplitAmounts((prev) => ({ ...prev, [m.value]: Number(e.target.value) || 0 }))}
                  />
                </div>
              ))}
              <div className="flex justify-between border-t border-glass-border pt-2 text-base">
                <span className="text-ink-muted">Remaining</span>
                <span className={cn("font-semibold", splitRemaining === 0 ? "text-emerald-600" : "text-red-600")}>
                  {formatCurrency(splitRemaining)}
                </span>
              </div>
              {checkoutError && <p className="text-sm font-medium text-red-500">{checkoutError}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setSplitOpen(false)}>
                  Back
                </Button>
                <Button disabled={splitRemaining !== 0 || splitTotal === 0} onClick={handleSplitComplete}>
                  Complete Split Payment
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {completedSale && (
        <ReceiptOverlay invoiceId={completedSale.invoiceId} cashInfo={completedSale.cash} onClose={() => setCompletedSale(null)} />
      )}
    </div>
  );
}
