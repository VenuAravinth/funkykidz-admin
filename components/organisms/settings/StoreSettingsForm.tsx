"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { storeTypes, type BusinessHoursEntry, type PosSettings, type StockSettings } from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectStoreSettings, updatePosSettings, updateStockSettings, updateStoreSettings, setBusinessHours } from "@/stores/slices/settingsSlice";

interface StoreSettingsFormValues {
  storeName: string;
  storeCode: string;
  storeType: (typeof storeTypes)[number];
  timezone: string;
  currency: string;
  businessHours: BusinessHoursEntry[];
  pos: PosSettings;
  stock: StockSettings;
}

const POS_TOGGLES: Array<{ key: keyof PosSettings; label: string }> = [
  { key: "allowWalkInCustomer", label: "Allow walk-in customer" },
  { key: "requireCustomerName", label: "Require customer name" },
  { key: "requireContactNumber", label: "Require contact number" },
  { key: "allowCreditSale", label: "Allow credit sale" },
  { key: "allowNegativeStock", label: "Allow negative stock" },
  { key: "autoHoldCart", label: "Auto hold cart" },
  { key: "autoGenerateInvoice", label: "Auto generate invoice" },
  { key: "autoPrintReceipt", label: "Auto print receipt" },
];

export function StoreSettingsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectStoreSettings);
  const [saved, setSaved] = useState(false);

  const { register, control, handleSubmit } = useForm<StoreSettingsFormValues>({ defaultValues: settings });
  const { fields } = useFieldArray({ control, name: "businessHours" });

  const onSubmit = handleSubmit((values) => {
    dispatch(updateStoreSettings({ storeName: values.storeName, storeCode: values.storeCode, storeType: values.storeType, timezone: values.timezone, currency: values.currency }));
    dispatch(updatePosSettings(values.pos));
    dispatch(updateStockSettings(values.stock));
    dispatch(setBusinessHours(values.businessHours));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Store settings updated.</FormAlert>}

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Store information</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="storeName" label="Store name" required>
            <Input id="storeName" {...register("storeName")} />
          </FormField>
          <FormField id="storeCode" label="Store code" required>
            <Input id="storeCode" {...register("storeCode")} />
          </FormField>
          <FormField id="storeType" label="Store type">
            <Select id="storeType" {...register("storeType")}>
              {storeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="timezone" label="Timezone">
            <Input id="timezone" {...register("timezone")} />
          </FormField>
          <FormField id="currency" label="Currency">
            <Input id="currency" {...register("currency")} />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Business hours</h3>
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-2 items-center gap-x-3 gap-y-2 border-b border-glass-border pb-3 last:border-b-0 sm:grid-cols-[100px_minmax(0,1fr)_minmax(0,1fr)_auto] sm:border-b-0 sm:pb-0"
            >
              <span className="text-sm font-medium text-ink">{field.day}</span>
              <div className="justify-self-end sm:order-last sm:justify-self-auto">
                <CheckboxField id={`closed-${field.id}`} label="Closed" {...register(`businessHours.${index}.closed`)} />
              </div>
              <Input type="time" aria-label={`${field.day} opening time`} {...register(`businessHours.${index}.open`)} />
              <Input type="time" aria-label={`${field.day} closing time`} {...register(`businessHours.${index}.close`)} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">POS settings</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {POS_TOGGLES.map((toggle) => (
            <CheckboxField key={toggle.key} id={`pos-${toggle.key}`} label={toggle.label} {...register(`pos.${toggle.key}`)} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Stock settings</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="defaultReorderLevel" label="Default reorder level">
            <Input id="defaultReorderLevel" type="number" min={0} {...register("stock.defaultReorderLevel", { valueAsNumber: true })} />
          </FormField>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CheckboxField id="stock-allowStockOverride" label="Allow stock override (permission required)" {...register("stock.allowStockOverride")} />
          <CheckboxField id="stock-allowNegativeStock" label="Allow negative stock" {...register("stock.allowNegativeStock")} />
          <CheckboxField id="stock-trackDamagedStock" label="Track damaged stock" {...register("stock.trackDamagedStock")} />
          <CheckboxField id="stock-trackReservedStock" label="Track reserved stock" {...register("stock.trackReservedStock")} />
        </div>
      </section>

      <div>
        <Button type="submit">Save Store Settings</Button>
      </div>
    </form>
  );
}
