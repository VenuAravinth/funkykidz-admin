"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { HiOutlineTrash, HiOutlinePlus } from "react-icons/hi2";
import {
  gstRegistrationTypes,
  indianStates,
  priceTaxModes,
  taxSystems,
  transactionTaxModes,
  type TaxSettings,
} from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { addTaxRate, removeTaxRate, selectTaxSettings, updateTaxRate, updateTaxSettings } from "@/stores/slices/settingsSlice";

type TaxFormValues = Omit<TaxSettings, "rates">;

export function TaxSettingsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectTaxSettings);
  const [saved, setSaved] = useState(false);
  const [newRateName, setNewRateName] = useState("");
  const [newRatePercent, setNewRatePercent] = useState(0);

  const { register, handleSubmit } = useForm<TaxFormValues>({ defaultValues: settings });

  const onSubmit = handleSubmit((values) => {
    dispatch(updateTaxSettings(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <div className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Tax settings updated.</FormAlert>}

      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Tax configuration</h3>
          <FormField id="taxSystem" label="Tax system" className="max-w-xs">
            <Select id="taxSystem" {...register("taxSystem")}>
              {taxSystems.map((system) => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </Select>
          </FormField>
        </section>

        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">GST settings</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormField id="gstin" label="GSTIN">
              <Input id="gstin" {...register("gstin")} />
            </FormField>
            <FormField id="registrationType" label="Registration type">
              <Select id="registrationType" {...register("registrationType")}>
                {gstRegistrationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField id="state" label="State">
              <Select id="state" {...register("state")}>
                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Tax behavior</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField id="productPriceMode" label="Product price">
              <Select id="productPriceMode" {...register("productPriceMode")}>
                {priceTaxModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField id="defaultTransactionTaxMode" label="Default transaction tax mode">
              <Select id="defaultTransactionTaxMode" {...register("defaultTransactionTaxMode")}>
                {transactionTaxModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <div className="mt-4">
            <CheckboxField
              id="allowTransactionLevelTaxChoice"
              label="Allow transaction-level tax choice"
              {...register("allowTransactionLevelTaxChoice")}
            />
          </div>
        </section>

        <div>
          <Button type="submit">Save Tax Settings</Button>
        </div>
      </form>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Configurable tax rates
        </h3>
        <div className="flex flex-col gap-2">
          {settings.rates.map((rate) => (
            <div key={rate.id} className="flex items-center gap-3">
              <span className="w-40 text-sm text-ink">{rate.name}</span>
              <Input
                type="number"
                min={0}
                max={100}
                className="w-28"
                value={rate.ratePercent}
                onChange={(e) => dispatch(updateTaxRate({ id: rate.id, ratePercent: Number(e.target.value) }))}
              />
              <span className="text-sm text-ink-muted">%</span>
              <IconButton
                label={`Remove ${rate.name}`}
                onClick={() => dispatch(removeTaxRate(rate.id))}
                className="ml-auto"
              >
                <HiOutlineTrash className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-end gap-3">
          <FormField id="newRateName" label="Name">
            <Input id="newRateName" value={newRateName} onChange={(e) => setNewRateName(e.target.value)} placeholder="e.g. GST 28%" />
          </FormField>
          <FormField id="newRatePercent" label="Rate %">
            <Input
              id="newRatePercent"
              type="number"
              min={0}
              max={100}
              className="w-28"
              value={newRatePercent}
              onChange={(e) => setNewRatePercent(Number(e.target.value))}
            />
          </FormField>
          <Button
            type="button"
            variant="secondary"
            disabled={!newRateName.trim()}
            onClick={() => {
              dispatch(addTaxRate({ name: newRateName.trim(), ratePercent: newRatePercent }));
              setNewRateName("");
              setNewRatePercent(0);
            }}
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add Rate
          </Button>
        </div>
      </section>
    </div>
  );
}
