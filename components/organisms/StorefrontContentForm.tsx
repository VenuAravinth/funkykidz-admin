"use client";

import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Switch } from "@/components/atoms/Switch";
import type { HomepageBanner } from "@/types/onlineStore";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectStorefrontContent, setBanners, updateStorefrontContent } from "@/stores/slices/onlineStoreSlice";

interface StorefrontContentFormValues {
  heroTitle: string;
  heroButtonLabel: string;
  heroImageUrl: string;
  announcementBar: string;
  banners: HomepageBanner[];
}

export function StorefrontContentForm() {
  const dispatch = useAppDispatch();
  const content = useAppSelector(selectStorefrontContent);
  const [saved, setSaved] = useState(false);

  const { register, control, handleSubmit } = useForm<StorefrontContentFormValues>({
    defaultValues: { ...content, heroImageUrl: content.heroImageUrl ?? "", announcementBar: content.announcementBar ?? "" },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "banners" });

  const onSubmit = handleSubmit((values) => {
    dispatch(
      updateStorefrontContent({
        heroTitle: values.heroTitle,
        heroButtonLabel: values.heroButtonLabel,
        heroImageUrl: values.heroImageUrl,
        announcementBar: values.announcementBar,
      }),
    );
    dispatch(setBanners(values.banners));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Storefront content updated.</FormAlert>}

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Hero banner</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="heroTitle" label="Title">
            <Input id="heroTitle" {...register("heroTitle")} />
          </FormField>
          <FormField id="heroButtonLabel" label="Button label">
            <Input id="heroButtonLabel" {...register("heroButtonLabel")} />
          </FormField>
          <FormField id="heroImageUrl" label="Hero image URL" className="sm:col-span-2">
            <Input id="heroImageUrl" placeholder="https://…" {...register("heroImageUrl")} />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Announcement bar</h3>
        <FormField id="announcementBar" label="Message">
          <Input id="announcementBar" placeholder="e.g. Free shipping on orders above ₹1,500" {...register("announcementBar")} />
        </FormField>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Promotional banners</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ id: `bnr_new_${fields.length}`, title: "", buttonLabel: "Shop Now", imageUrl: "", active: true })}
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add Banner
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {fields.length > 0 && (
            <div className="hidden grid-cols-[1fr_1fr_4rem_2.5rem] gap-3 px-3 text-xs font-medium uppercase tracking-wide text-ink-muted sm:grid">
              <span>Title</span>
              <span>Button label</span>
              <span>Active</span>
              <span />
            </div>
          )}
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-glass-border bg-white/40 p-3 sm:grid-cols-[1fr_1fr_4rem_2.5rem]"
            >
              <Input placeholder="Banner title" aria-label="Banner title" className="col-span-3 sm:col-span-1" {...register(`banners.${index}.title`)} />
              <Input placeholder="Button label" aria-label="Button label" {...register(`banners.${index}.buttonLabel`)} />
              <Controller
                control={control}
                name={`banners.${index}.active`}
                render={({ field: active }) => (
                  <Switch
                    checked={active.value}
                    onCheckedChange={active.onChange}
                    label={`Banner ${index + 1}: ${active.value ? "Active" : "Inactive"}`}
                    title={active.value ? "Active" : "Inactive"}
                  />
                )}
              />
              <IconButton label="Remove banner" onClick={() => remove(index)} className="hover:bg-red-50 hover:text-red-600">
                <HiOutlineTrash className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
          {fields.length === 0 && <p className="text-sm text-ink-muted">No banners yet — add one above.</p>}
        </div>
      </section>

      <div>
        <Button type="submit">Save Storefront Content</Button>
      </div>
    </form>
  );
}
