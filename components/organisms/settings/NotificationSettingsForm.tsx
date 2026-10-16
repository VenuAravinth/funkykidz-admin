"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import type { NotificationSettings, NotificationTypeToggles } from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectNotificationSettings, toggleNotificationType, updateNotificationChannel, updateNotificationThresholds, updatePaymentReminders } from "@/stores/slices/settingsSlice";

const TYPE_GROUPS: Array<{ label: string; keys: Array<{ key: keyof NotificationTypeToggles; label: string }> }> = [
  {
    label: "Inventory",
    keys: [
      { key: "lowStock", label: "Low Stock" },
      { key: "outOfStock", label: "Out of Stock" },
      { key: "stockAdjustment", label: "Stock Adjustment" },
    ],
  },
  {
    label: "Purchase",
    keys: [
      { key: "poDeliveryDue", label: "PO Delivery Due" },
      { key: "poOverdue", label: "PO Overdue" },
    ],
  },
  {
    label: "Finance",
    keys: [
      { key: "supplierPaymentDue", label: "Supplier Payment Due" },
      { key: "customerPaymentDue", label: "Customer Payment Due" },
    ],
  },
  {
    label: "Sales",
    keys: [
      { key: "newOnlineOrder", label: "New Online Order" },
      { key: "paymentFailed", label: "Payment Failed" },
      { key: "refund", label: "Refund" },
    ],
  },
  {
    label: "System",
    keys: [
      { key: "backupCompleted", label: "Backup Completed" },
      { key: "backupFailed", label: "Backup Failed" },
      { key: "userActivity", label: "User Activity" },
    ],
  },
];

const REMINDER_TOGGLES: Array<{ key: keyof NotificationSettings["paymentReminders"]; label: string }> = [
  { key: "sevenDaysBefore", label: "7 days before due" },
  { key: "threeDaysBefore", label: "3 days before due" },
  { key: "onDueDate", label: "Due date" },
  { key: "oneDayOverdue", label: "1 day overdue" },
  { key: "sevenDaysOverdue", label: "7 days overdue" },
];

export function NotificationSettingsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectNotificationSettings);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit } = useForm<Pick<NotificationSettings, "lowStockThreshold" | "criticalStockThreshold">>({
    defaultValues: { lowStockThreshold: settings.lowStockThreshold, criticalStockThreshold: settings.criticalStockThreshold },
  });

  const onSubmit = handleSubmit((values) => {
    dispatch(updateNotificationThresholds(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <div className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Notification settings updated.</FormAlert>}

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Notification types</h3>
        <div className="flex flex-col gap-5">
          {TYPE_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-sm font-medium text-ink">{group.label}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {group.keys.map(({ key, label }) => (
                  <CheckboxField
                    key={key}
                    id={`type-${key}`}
                    label={label}
                    checked={settings.types[key]}
                    onChange={() => dispatch(toggleNotificationType(key))}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Notification channels</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-glass-border text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <th className="py-2 pr-4">Type</th>
                <th className="px-2 py-2 text-center">In-App</th>
                <th className="px-2 py-2 text-center">Sound</th>
                <th className="px-2 py-2 text-center">Email</th>
              </tr>
            </thead>
            <tbody>
              {settings.channels.map((row) => (
                <tr key={row.key} className="border-b border-glass-border/60">
                  <td className="py-3 pr-4 font-medium text-ink">{row.label}</td>
                  {(["inApp", "sound", "email"] as const).map((channel) => (
                    <td key={channel} className="px-2 py-3 text-center">
                      <Checkbox
                        checked={row[channel]}
                        onChange={(e) => dispatch(updateNotificationChannel({ key: row.key, channel, value: e.target.checked }))}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form onSubmit={onSubmit}>
        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Thresholds</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField id="lowStockThreshold" label="Low stock alert — when stock ≤">
              <Input id="lowStockThreshold" type="number" min={0} {...register("lowStockThreshold", { valueAsNumber: true })} />
            </FormField>
            <FormField id="criticalStockThreshold" label="Critical stock — when stock ≤">
              <Input id="criticalStockThreshold" type="number" min={0} {...register("criticalStockThreshold", { valueAsNumber: true })} />
            </FormField>
          </div>
        </section>
        <div className="mt-6">
          <Button type="submit">Save Thresholds</Button>
        </div>
      </form>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Customer payment reminders</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {REMINDER_TOGGLES.map(({ key, label }) => (
            <CheckboxField
              key={key}
              id={`reminder-${key}`}
              label={label}
              checked={settings.paymentReminders[key]}
              onChange={(e) => dispatch(updatePaymentReminders({ [key]: e.target.checked }))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
