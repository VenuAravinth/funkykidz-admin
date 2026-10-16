"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { barcodeSymbologies, scannerActions, type GlobalBarcodeSettings } from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectBarcodeGlobalSettings, updateBarcodeGlobalSettings } from "@/stores/slices/settingsSlice";

const LABEL_FIELD_TOGGLES: Array<{ key: keyof GlobalBarcodeSettings["labelFields"]; label: string }> = [
  { key: "productName", label: "Product name" },
  { key: "price", label: "Price" },
  { key: "size", label: "Size" },
  { key: "color", label: "Colour" },
  { key: "barcode", label: "Barcode" },
  { key: "businessName", label: "Business name" },
];

export function BarcodeGlobalSettingsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectBarcodeGlobalSettings);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit } = useForm<GlobalBarcodeSettings>({ defaultValues: settings });

  const onSubmit = handleSubmit((values) => {
    dispatch(updateBarcodeGlobalSettings(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Barcode settings updated.</FormAlert>}

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Barcode type</h3>
        <FormField id="symbology" label="Symbology" className="max-w-xs">
          <Select id="symbology" {...register("symbology")}>
            {barcodeSymbologies.map((symbology) => (
              <option key={symbology} value={symbology}>
                {symbology}
              </option>
            ))}
          </Select>
        </FormField>
        <p className="mt-2 text-xs text-ink-muted">Product barcodes are issued automatically for every colour and size (EAN-13).</p>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Barcode generation</h3>
        <FormField id="barcodePrefix" label="Barcode prefix" className="max-w-xs">
          <Input id="barcodePrefix" {...register("barcodePrefix")} />
        </FormField>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Label settings</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="labelWidthMm" label="Label width (mm)">
            <Input id="labelWidthMm" type="number" min={10} {...register("labelWidthMm", { valueAsNumber: true })} />
          </FormField>
          <FormField id="labelHeightMm" label="Label height (mm)">
            <Input id="labelHeightMm" type="number" min={10} {...register("labelHeightMm", { valueAsNumber: true })} />
          </FormField>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LABEL_FIELD_TOGGLES.map((toggle) => (
            <CheckboxField
              key={toggle.key}
              id={`labelFields.${toggle.key}`}
              label={toggle.label}
              {...register(`labelFields.${toggle.key}`)}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Scanner behavior</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="scannerActionPos" label="After scan (POS)">
            <Select id="scannerActionPos" {...register("scannerActionPos")}>
              {scannerActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="scannerActionGoodsReceived" label="After scan (Goods Received)">
            <Select id="scannerActionGoodsReceived" {...register("scannerActionGoodsReceived")}>
              {scannerActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </section>

      <div>
        <Button type="submit">Save Barcode Settings</Button>
      </div>
    </form>
  );
}
