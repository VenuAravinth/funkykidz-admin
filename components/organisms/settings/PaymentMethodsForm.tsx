"use client";

import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Card } from "@/components/atoms/Card";
import { Switch } from "@/components/atoms/Switch";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import type { PaymentMethodConfig, PaymentSettings } from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectPaymentSettings, updatePaymentMethod, setAllowSplitPayment } from "@/stores/slices/settingsSlice";

function MethodExtraFields({
  index,
  methodId,
  register,
}: {
  index: number;
  methodId: PaymentMethodConfig["id"];
  register: ReturnType<typeof useForm<PaymentSettings>>["register"];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {methodId === "upi" && (
        <>
          <FormField id={`methods.${index}.upiId`} label="UPI ID">
            <Input id={`methods.${index}.upiId`} {...register(`methods.${index}.upiId`)} />
          </FormField>
          <FormField id={`methods.${index}.paymentGateway`} label="Payment gateway (optional)">
            <Input id={`methods.${index}.paymentGateway`} {...register(`methods.${index}.paymentGateway`)} />
          </FormField>
        </>
      )}
      {methodId === "card" && (
        <>
          <FormField id={`methods.${index}.provider`} label="Card provider">
            <Input id={`methods.${index}.provider`} {...register(`methods.${index}.provider`)} />
          </FormField>
          <FormField id={`methods.${index}.transactionFeePercent`} label="Transaction fee %">
            <Input
              id={`methods.${index}.transactionFeePercent`}
              type="number"
              min={0}
              step="0.1"
              {...register(`methods.${index}.transactionFeePercent`, { valueAsNumber: true })}
            />
          </FormField>
        </>
      )}
      {methodId === "credit" && (
        <>
          <FormField id={`methods.${index}.defaultCreditPeriodDays`} label="Default credit period (days)">
            <Input
              id={`methods.${index}.defaultCreditPeriodDays`}
              type="number"
              min={0}
              {...register(`methods.${index}.defaultCreditPeriodDays`, { valueAsNumber: true })}
            />
          </FormField>
          <div className="flex items-end pb-2.5">
            <CheckboxField id={`methods.${index}.requireApproval`} label="Require approval" {...register(`methods.${index}.requireApproval`)} />
          </div>
        </>
      )}
    </div>
  );
}

export function PaymentMethodsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectPaymentSettings);
  const [saved, setSaved] = useState(false);

  const { register, control, handleSubmit } = useForm<PaymentSettings>({ defaultValues: settings });
  const { fields } = useFieldArray({ control, name: "methods" });
  const watchedMethods = useWatch({ control, name: "methods" }) as PaymentMethodConfig[] | undefined;

  const onSubmit = handleSubmit((values) => {
    values.methods.forEach((method) => dispatch(updatePaymentMethod({ id: method.id, changes: method })));
    dispatch(setAllowSplitPayment(values.allowSplitPayment));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {saved && <FormAlert variant="success">Payment methods updated.</FormAlert>}

      {fields.map((field, index) => {
        const isEnabled = watchedMethods?.[index]?.enabled ?? field.enabled;
        return (
          <Card key={field.id} className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">{field.label}</h3>
              <Controller
                control={control}
                name={`methods.${index}.enabled`}
                render={({ field: enabled }) => (
                  <Switch
                    checked={enabled.value}
                    onCheckedChange={enabled.onChange}
                    label={`${field.label}: ${enabled.value ? "Enabled" : "Disabled"}`}
                    title={enabled.value ? "Enabled" : "Disabled"}
                  />
                )}
              />
            </div>
            {isEnabled && (
              <div className="flex flex-col gap-4">
                <CheckboxField id={`methods.${index}.allowInPos`} label="Allow in POS" {...register(`methods.${index}.allowInPos`)} />
                {(field.id === "upi" || field.id === "card" || field.id === "credit") && (
                  <MethodExtraFields index={index} methodId={field.id} register={register} />
                )}
              </div>
            )}
          </Card>
        );
      })}

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-ink">Split payments</h3>
        <CheckboxField id="allowSplitPayment" label="Allow split payment (e.g. part cash, part UPI)" {...register("allowSplitPayment")} />
      </Card>

      <div>
        <Button type="submit">Save Payment Methods</Button>
      </div>
    </form>
  );
}
