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
  invoiceDocumentLabels,
  invoiceDocumentTypes,
  invoiceStyles,
  type InvoiceSettings,
} from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectInvoiceSettings, updateInvoiceSettings } from "@/stores/slices/settingsSlice";

const INFO_TOGGLES: Array<{ key: keyof InvoiceSettings; label: string }> = [
  { key: "showBusinessLogo", label: "Business logo" },
  { key: "showGstin", label: "GSTIN" },
  { key: "showCustomerName", label: "Customer name" },
  { key: "showCustomerPhone", label: "Customer phone" },
  { key: "showHsnSac", label: "HSN/SAC" },
  { key: "showBarcode", label: "Barcode" },
  { key: "showTaxBreakdown", label: "Tax breakdown" },
  { key: "showDiscount", label: "Discount" },
  { key: "showRoundOff", label: "Round off" },
  { key: "showPaymentMethod", label: "Payment method" },
  { key: "showCashier", label: "Cashier" },
  { key: "showTermsAndConditions", label: "Terms & conditions" },
];

export function InvoiceSettingsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectInvoiceSettings);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit } = useForm<InvoiceSettings>({ defaultValues: settings });

  const onSubmit = handleSubmit((values) => {
    dispatch(updateInvoiceSettings(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Invoice settings updated.</FormAlert>}

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Numbering sequences
        </h3>
        <div className="flex flex-col gap-3">
          {invoiceDocumentTypes.map((docType) => (
            <div key={docType} className="grid grid-cols-2 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_120px_140px]">
              <span className="col-span-2 text-sm font-medium text-ink sm:col-span-1 sm:pb-2.5">{invoiceDocumentLabels[docType]}</span>
              <FormField id={`${docType}-prefix`} label="Prefix">
                <Input id={`${docType}-prefix`} {...register(`sequences.${docType}.prefix`)} />
              </FormField>
              <FormField id={`${docType}-start`} label="Starting no.">
                <Input
                  id={`${docType}-start`}
                  type="number"
                  min={1}
                  {...register(`sequences.${docType}.startingNumber`, { valueAsNumber: true })}
                />
              </FormField>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Invoice format</h3>
        <FormField id="style" label="Invoice style" className="max-w-xs">
          <Select id="style" {...register("style")}>
            {invoiceStyles.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </Select>
        </FormField>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Invoice information</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INFO_TOGGLES.map((toggle) => (
            <CheckboxField key={toggle.key} id={toggle.key} label={toggle.label} {...register(toggle.key as "showBusinessLogo")} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Footer</h3>
        <FormField id="thankYouMessage" label="Thank you message">
          <Input id="thankYouMessage" {...register("thankYouMessage")} />
        </FormField>
      </section>

      <div>
        <Button type="submit">Save Invoice Settings</Button>
      </div>
    </form>
  );
}
