"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import type { ManagerPinRequirements, SecuritySettings } from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectSecuritySettings, updateSecuritySettings, updateManagerPinRequirements } from "@/stores/slices/settingsSlice";

const PIN_TOGGLES: Array<{ key: keyof ManagerPinRequirements; label: string }> = [
  { key: "highDiscount", label: "High Discount" },
  { key: "priceOverride", label: "Price Override" },
  { key: "refund", label: "Refund" },
  { key: "stockAdjustment", label: "Stock Adjustment" },
  { key: "invoiceCancellation", label: "Invoice Cancellation" },
  { key: "supplierPayment", label: "Supplier Payment" },
];

export function SecuritySettingsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSecuritySettings);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit } = useForm<Omit<SecuritySettings, "managerPinRequirements">>({
    defaultValues: {
      sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
      maxFailedLoginAttempts: settings.maxFailedLoginAttempts,
      require2faForAdmin: settings.require2faForAdmin,
      autoLogoutOnIdle: settings.autoLogoutOnIdle,
    },
  });

  const onSubmit = handleSubmit((values) => {
    dispatch(updateSecuritySettings(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Security settings updated.</FormAlert>}

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Access control</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="sessionTimeoutMinutes" label="Session timeout (minutes)">
            <Input id="sessionTimeoutMinutes" type="number" min={1} {...register("sessionTimeoutMinutes", { valueAsNumber: true })} />
          </FormField>
          <FormField id="maxFailedLoginAttempts" label="Maximum failed login attempts">
            <Input id="maxFailedLoginAttempts" type="number" min={1} {...register("maxFailedLoginAttempts", { valueAsNumber: true })} />
          </FormField>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <CheckboxField id="require2faForAdmin" label="Require 2FA for admin" {...register("require2faForAdmin")} />
          <CheckboxField id="autoLogoutOnIdle" label="Auto logout on idle" {...register("autoLogoutOnIdle")} />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Require manager PIN for</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PIN_TOGGLES.map((toggle) => (
            <CheckboxField
              key={toggle.key}
              id={`pin-${toggle.key}`}
              label={toggle.label}
              checked={settings.managerPinRequirements[toggle.key]}
              onChange={(e) => dispatch(updateManagerPinRequirements({ [toggle.key]: e.target.checked }))}
            />
          ))}
        </div>
      </section>

      <div>
        <Button type="submit">Save Security Settings</Button>
      </div>
    </form>
  );
}
