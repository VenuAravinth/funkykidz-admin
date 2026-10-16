"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import {
  customerAccountModes,
  onlineStoreStatuses,
  reserveStockTriggers,
  type OnlineStoreSettings,
} from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  selectOnlineStoreSettings,
  updateOnlineCustomerPolicy,
  updateOnlineInventorySettings,
  updateOnlineOrderPolicy,
  updateOnlineShippingPolicy,
  updateOnlineStoreBehavior,
  updateOnlineStoreInfo,
} from "@/stores/slices/settingsSlice";

const BEHAVIOR_TOGGLES: Array<{ key: keyof OnlineStoreSettings["behavior"]; label: string }> = [
  { key: "allowGuestCheckout", label: "Allow Guest Checkout" },
  { key: "requirePhoneNumber", label: "Require Phone Number" },
  { key: "requireEmail", label: "Require Email" },
  { key: "showStockAvailability", label: "Show Stock Availability" },
  { key: "allowOutOfStockProducts", label: "Allow Out-of-Stock Products" },
  { key: "allowProductReviews", label: "Allow Product Reviews" },
  { key: "allowWishlist", label: "Allow Wishlist" },
];

export function OnlineStoreSettingsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectOnlineStoreSettings);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit } = useForm<OnlineStoreSettings>({ defaultValues: settings });

  const onSubmit = handleSubmit((values) => {
    dispatch(updateOnlineStoreInfo(values.info));
    dispatch(updateOnlineStoreBehavior(values.behavior));
    dispatch(updateOnlineInventorySettings(values.inventory));
    dispatch(updateOnlineOrderPolicy(values.orders));
    dispatch(updateOnlineShippingPolicy(values.shipping));
    dispatch(updateOnlineCustomerPolicy(values.customer));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Online store settings updated.</FormAlert>}

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Store information</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="storeName" label="Store name" required>
            <Input id="storeName" {...register("info.storeName")} />
          </FormField>
          <FormField id="storeUrl" label="Store URL">
            <Input id="storeUrl" {...register("info.storeUrl")} />
          </FormField>
          <FormField id="storeStatus" label="Store status">
            <Select id="storeStatus" {...register("info.storeStatus")}>
              {onlineStoreStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="currency" label="Currency">
            <Input id="currency" {...register("info.currency")} />
          </FormField>
          <FormField id="language" label="Language">
            <Input id="language" {...register("info.language")} />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Store behavior</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BEHAVIOR_TOGGLES.map((toggle) => (
            <CheckboxField key={toggle.key} id={`behavior-${toggle.key}`} label={toggle.label} {...register(`behavior.${toggle.key}`)} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Inventory behavior</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField id="onlineStockSource" label="Online stock source">
            <Input id="onlineStockSource" {...register("inventory.onlineStockSource")} />
          </FormField>
          <FormField id="reserveStockOn" label="Reserve stock on">
            <Select id="reserveStockOn" {...register("inventory.reserveStockOn")}>
              {reserveStockTriggers.map((trigger) => (
                <option key={trigger} value={trigger}>
                  {trigger}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="releaseReservedStockMinutes" label="Release reserved stock after (minutes)">
            <Input
              id="releaseReservedStockMinutes"
              type="number"
              min={0}
              {...register("inventory.releaseReservedStockMinutes", { valueAsNumber: true })}
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Order settings</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="minimumOrderValue" label="Minimum order value (₹)">
            <Input id="minimumOrderValue" type="number" min={0} {...register("orders.minimumOrderValue", { valueAsNumber: true })} />
          </FormField>
          <FormField id="maximumOrderValue" label="Maximum order value (₹)">
            <Input id="maximumOrderValue" type="number" min={0} {...register("orders.maximumOrderValue", { valueAsNumber: true })} />
          </FormField>
          <FormField id="codMaximum" label="COD maximum (₹)">
            <Input id="codMaximum" type="number" min={0} {...register("orders.codMaximum", { valueAsNumber: true })} />
          </FormField>
          <div className="flex items-end pb-2.5">
            <CheckboxField id="codAvailable" label="COD Available" {...register("orders.codAvailable")} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Shipping settings</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField id="freeShippingAbove" label="Free shipping above (₹)">
            <Input id="freeShippingAbove" type="number" min={0} {...register("shipping.freeShippingAbove", { valueAsNumber: true })} />
          </FormField>
          <FormField id="defaultShippingFee" label="Default shipping fee (₹)">
            <Input id="defaultShippingFee" type="number" min={0} {...register("shipping.defaultShippingFee", { valueAsNumber: true })} />
          </FormField>
          <FormField id="codFee" label="COD fee (₹)">
            <Input id="codFee" type="number" min={0} {...register("shipping.codFee", { valueAsNumber: true })} />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Customer settings</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="customerAccount" label="Customer account">
            <Select id="customerAccount" {...register("customer.customerAccount")}>
              {customerAccountModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CheckboxField id="guestCheckout" label="Guest Checkout" {...register("customer.guestCheckout")} />
          <CheckboxField id="phoneMandatory" label="Phone Mandatory" {...register("customer.phoneMandatory")} />
        </div>
      </section>

      <div>
        <Button type="submit">Save Online Store Settings</Button>
      </div>
    </form>
  );
}
