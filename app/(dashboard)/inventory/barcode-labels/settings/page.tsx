"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/atoms/Card";
import { Select } from "@/components/atoms/Select";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { LabelPreview } from "@/components/organisms/LabelPreview";
import { labelSizes, type BarcodeSettings } from "@/types/barcode";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectBarcodeSettings, updateBarcodeSettings } from "@/stores/slices/barcodeSlice";

const LABEL_SIZE_LABELS: Record<(typeof labelSizes)[number], string> = {
  "40x25": "40 × 25 mm (small)",
  "50x30": "50 × 30 mm (standard)",
  "63x38": "63 × 38 mm (large)",
};

export default function BarcodeSettingsPage() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectBarcodeSettings);
  const [saved, setSaved] = useState(false);

  const { register, watch, handleSubmit } = useForm<BarcodeSettings>({ defaultValues: settings });
  const preview = watch();

  const onSubmit = handleSubmit((values) => {
    dispatch(updateBarcodeSettings(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card className="p-6">
        <h2 className="mb-5 text-sm font-semibold text-ink">Label defaults</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {saved && <FormAlert variant="success">Settings updated.</FormAlert>}

          <FormField id="labelSize" label="Label size">
            <Select id="labelSize" {...register("labelSize")}>
              {labelSizes.map((size) => (
                <option key={size} value={size}>
                  {LABEL_SIZE_LABELS[size]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="defaultQuantity" label="Default quantity">
            <Input id="defaultQuantity" type="number" min={1} max={500} {...register("defaultQuantity", { valueAsNumber: true })} />
          </FormField>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Label contents</p>
            <div className="flex flex-col gap-3">
              <CheckboxField id="showStoreName" label="Show store name (Funky Kids)" {...register("showStoreName")} />
              <CheckboxField id="showPrice" label="Show price" {...register("showPrice")} />
            </div>
          </div>

          <div>
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </Card>

      <Card className="flex flex-col items-center gap-4 p-6">
        <h2 className="self-start text-sm font-semibold text-ink">Preview</h2>
        <div className="flex max-w-full justify-center overflow-x-auto">
          <LabelPreview
            data={{ productName: "Sample Product", size: "4-5Y", color: "Pink", price: 799, barcode: "2000000000015" }}
            settings={preview}
          />
        </div>
      </Card>
    </div>
  );
}
