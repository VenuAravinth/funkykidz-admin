"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { businessTypes, indianStates, type BusinessProfileSettings } from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectBusinessProfile, updateBusinessProfile } from "@/stores/slices/settingsSlice";

export function BusinessProfileForm() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectBusinessProfile);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit } = useForm<BusinessProfileSettings>({ defaultValues: profile });

  const onSubmit = handleSubmit((values) => {
    dispatch(updateBusinessProfile(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Business profile updated.</FormAlert>}

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Business information</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="businessName" label="Business name" required>
            <Input id="businessName" {...register("businessName")} />
          </FormField>
          <FormField id="legalName" label="Legal / registered name">
            <Input id="legalName" {...register("legalName")} />
          </FormField>
          <FormField id="businessType" label="Business type">
            <Select id="businessType" {...register("businessType")}>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="phone" label="Phone" required>
            <Input id="phone" {...register("phone")} />
          </FormField>
          <FormField id="whatsapp" label="WhatsApp">
            <Input id="whatsapp" {...register("whatsapp")} />
          </FormField>
          <FormField id="email" label="Email">
            <Input id="email" type="email" {...register("email")} />
          </FormField>
          <FormField id="website" label="Website">
            <Input id="website" {...register("website")} />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Address</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="address" label="Address" required className="sm:col-span-2">
            <Input id="address" {...register("address")} />
          </FormField>
          <FormField id="city" label="City">
            <Input id="city" {...register("city")} />
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
          <FormField id="pincode" label="Pincode">
            <Input id="pincode" {...register("pincode")} />
          </FormField>
          <FormField id="country" label="Country">
            <Input id="country" {...register("country")} />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Tax / business identification
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField id="gstin" label="GSTIN">
            <Input id="gstin" {...register("gstin")} />
          </FormField>
          <FormField id="pan" label="PAN">
            <Input id="pan" {...register("pan")} />
          </FormField>
          <FormField id="registrationNumber" label="Business registration no.">
            <Input id="registrationNumber" {...register("registrationNumber")} />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Branding</h3>
        <p className="mb-4 text-xs text-ink-muted">
          Used automatically on invoices, quotations, estimations, purchase orders, receipts, PDF reports, and
          WhatsApp messages.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="logoUrl" label="Business logo URL">
            <Input id="logoUrl" placeholder="https://…" {...register("logoUrl")} />
          </FormField>
          <FormField id="faviconUrl" label="Favicon URL">
            <Input id="faviconUrl" placeholder="https://…" {...register("faviconUrl")} />
          </FormField>
          <FormField id="primaryBrandName" label="Primary brand name" required>
            <Input id="primaryBrandName" {...register("primaryBrandName")} />
          </FormField>
        </div>
      </section>

      <div>
        <Button type="submit">Save Business Profile</Button>
      </div>
    </form>
  );
}
