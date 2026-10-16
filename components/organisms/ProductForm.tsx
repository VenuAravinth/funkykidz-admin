"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useFieldArray, useForm, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput, type ProductWrite } from "@/features/products/schema";
import { createProduct, updateProduct, type AiProductAnalysis } from "@/features/products/api";
import { ProductAiAssistant } from "@/components/organisms/ProductAiAssistant";
import { IconButton } from "@/components/atoms/IconButton";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { ProductImageUploader } from "@/components/organisms/ProductImageUploader";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Switch } from "@/components/atoms/Switch";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectBrands, selectCategories } from "@/stores/slices/catalogSlice";
import {
  productAttributeKeys,
  productGenders,
  productSizeSuggestions,
  productTags,
  type Category,
  type Product,
  type ProductAttributeKey,
} from "@/types/product";

export interface ProductFormProps {
  product?: Product;
  onDone: () => void;
  onCancel: () => void;
}

const DEFAULT_HEX = "#f4a7b9";

const ATTRIBUTE_FIELDS: { key: ProductAttributeKey; label: string; placeholder: string }[] = [
  { key: "productType", label: "Product type", placeholder: "e.g. Hanbok set" },
  { key: "pattern", label: "Pattern & design", placeholder: "e.g. Floral embroidery" },
  { key: "neckType", label: "Neck type", placeholder: "e.g. Round neck" },
  { key: "sleeveType", label: "Sleeve type", placeholder: "e.g. Puff sleeves" },
  { key: "ageGroup", label: "Recommended age", placeholder: "e.g. 3–5 years" },
  { key: "occasion", label: "Style & occasion", placeholder: "e.g. Festive, Birthday" },
];

const toAttributes = (attributes: Product["attributes"] = {}) =>
  Object.fromEntries(productAttributeKeys.map((k) => [k, attributes[k] ?? ""])) as Record<ProductAttributeKey, string>;

function toDefaultValues(product: Product | undefined, categories: Category[]): ProductInput {
  if (!product) {
    return {
      name: "",
      sku: "",
      categoryId: "",
      brandId: "",
      subcategory: "",
      gender: "Unisex",
      tag: "",
      originalPrice: 0,
      price: 0,
      costPrice: 0,
      reorderLevel: 5,
      shortDescription: "",
      description: "",
      fabric: "",
      fit: "",
      care: "",
      images: [],
      attributes: toAttributes(),
      colors: [{ name: "", hex: DEFAULT_HEX, sizes: [{ size: "", stock: 0 }] }],
      published: false,
    };
  }
  const hexByName = new Map(product.colors.map((c) => [c.name, c.hex]));
  const colors = [...new Set(product.variants.map((v) => v.color))].map((name) => ({
    name,
    hex: hexByName.get(name) ?? DEFAULT_HEX,
    sizes: product.variants.filter((v) => v.color === name).map((v) => ({ id: v.id, size: v.size, stock: v.stock })),
  }));
  return {
    name: product.name,
    sku: product.sku ?? "",
    categoryId: product.categoryId || categories.find((c) => c.name.toLowerCase() === product.category?.toLowerCase())?.id || "",
    brandId: product.brandId ?? "",
    subcategory: product.subcategory ?? "",
    gender: product.gender,
    tag: product.tag ?? "",
    originalPrice: product.originalPrice ?? product.price,
    price: product.price,
    costPrice: product.costPrice,
    reorderLevel: product.reorderLevel,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    fabric: product.fabric ?? "",
    fit: product.fit ?? "",
    care: product.care ?? "",
    images: product.images,
    attributes: toAttributes(product.attributes),
    colors,
    published: product.published,
  };
}

function toWrite(values: ProductInput, product?: Product): ProductWrite {
  const before = new Map(product?.variants.map((v) => [v.id, v.stock]));
  return {
    name: values.name,
    sku: values.sku ? values.sku.toUpperCase() : null,
    categoryId: values.categoryId,
    brandId: values.brandId || null,
    subcategory: values.subcategory,
    gender: values.gender,
    tag: values.tag || null,
    price: values.price,
    oldPrice: values.originalPrice,
    costPrice: values.costPrice,
    reorderLevel: values.reorderLevel,
    shortDescription: values.shortDescription,
    description: values.description,
    fabric: values.fabric,
    fit: values.fit,
    care: values.care,
    images: values.images,
    attributes: values.attributes,
    published: values.published,
    colors: values.colors.map((c) => ({ name: c.name.trim(), hex: c.hex })),
    variants: values.colors.flatMap((c) =>
      c.sizes.map((s) => ({
        id: s.id,
        color: c.name.trim(),
        size: s.size.trim(),
        ...(!s.id || before.get(s.id) !== s.stock ? { stock: s.stock } : {}),
      })),
    ),
  };
}

const textareaClass =
  "w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60";

const stockValue = (v: string) => (v === "" ? null : Number(v));

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="border-t border-glass-border px-5 py-6 first:border-t-0 sm:px-8">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

interface ColorBlockProps {
  index: number;
  control: Control<ProductInput>;
  register: UseFormRegister<ProductInput>;
  errors: FieldErrors<ProductInput>;
  barcodes: Map<string, string>;
  sizesInUse: string[];
  canRemove: boolean;
  onRemove: () => void;
}

function ColorBlock({ index, control, register, errors, barcodes, sizesInUse, canRemove, onRemove }: ColorBlockProps) {
  const { fields, append, remove } = useFieldArray({ control, name: `colors.${index}.sizes`, keyName: "fieldKey" });
  const colorErrors = errors.colors?.[index];
  const used = new Set(sizesInUse.map((s) => s.toLowerCase()));

  return (
    <div className="rounded-2xl border border-glass-border bg-white/40">
      <div className="flex flex-wrap items-end gap-3 border-b border-glass-border p-4">
        <FormField id={`colors.${index}.name`} label="Colour" error={colorErrors?.name?.message} required className="min-w-0 flex-1">
          <div className="flex gap-2">
            <input
              type="color"
              aria-label="Swatch colour"
              className="h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-glass-border bg-white/60 p-1"
              {...register(`colors.${index}.hex`)}
            />
            <Input id={`colors.${index}.name`} placeholder="e.g. Rose" hasError={!!colorErrors?.name} {...register(`colors.${index}.name`)} />
          </div>
        </FormField>
        {canRemove && (
          <Button type="button" variant="ghost" onClick={onRemove} className="hover:bg-red-50 hover:text-red-600">
            <HiOutlineTrash className="h-4.5 w-4.5" />
            Remove colour
          </Button>
        )}
      </div>

      <div className="p-4">
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_2.5rem] gap-3 px-1 pb-2 text-xs font-medium uppercase tracking-wide text-ink-muted sm:grid">
          <span>Size</span>
          <span>Stock</span>
          <span>Barcode</span>
          <span />
        </div>
        <div className="flex flex-col gap-3">
          {fields.map((field, si) => {
            const rowErrors = colorErrors?.sizes?.[si];
            const barcode = field.id ? barcodes.get(field.id) : undefined;
            return (
              <div
                key={field.fieldKey}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_2.5rem] items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_2.5rem]"
              >
                <div>
                  <Input
                    aria-label="Size"
                    list="product-size-suggestions"
                    placeholder="e.g. 2-3Y"
                    hasError={!!rowErrors?.size}
                    {...register(`colors.${index}.sizes.${si}.size`)}
                  />
                  {rowErrors?.size && <p className="mt-1 text-xs font-medium text-red-500">{rowErrors.size.message}</p>}
                </div>
                <div>
                  <Input
                    aria-label="Stock"
                    type="number"
                    min="0"
                    placeholder="Not tracked"
                    hasError={!!rowErrors?.stock}
                    {...register(`colors.${index}.sizes.${si}.stock`, { setValueAs: stockValue })}
                  />
                  {rowErrors?.stock && <p className="mt-1 text-xs font-medium text-red-500">{rowErrors.stock.message}</p>}
                </div>
                <p className="col-span-full -mt-1 text-xs text-ink-muted sm:col-span-1 sm:mt-0 sm:flex sm:h-11 sm:items-center">
                  {barcode ? <span className="font-mono text-sm text-ink">{barcode}</span> : "Assigned on save"}
                </p>
                <IconButton
                  label="Remove size"
                  onClick={() => remove(si)}
                  disabled={fields.length === 1}
                  className="row-start-1 col-start-3 hover:bg-red-50 hover:text-red-600 sm:col-start-4"
                >
                  <HiOutlineTrash className="h-4.5 w-4.5" />
                </IconButton>
              </div>
            );
          })}
        </div>
        {colorErrors?.sizes?.message && <p className="mt-2 text-xs font-medium text-red-500">{colorErrors.sizes.message}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <Button type="button" variant="secondary" size="sm" onClick={() => append({ size: "", stock: 0 })}>
            <HiOutlinePlus className="h-4 w-4" />
            Add size
          </Button>
          {productSizeSuggestions
            .filter((s) => !used.has(s.toLowerCase()))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => append({ size: s, stock: 0 })}
                className="rounded-full border border-glass-border bg-white/60 px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-white hover:text-ink"
              >
                + {s}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export function ProductForm({ product, onDone, onCancel }: ProductFormProps) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const brands = useAppSelector(selectBrands);
  const barcodes = new Map(product?.variants.map((v) => [v.id, v.barcode]));
  const [uploading, setUploading] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: toDefaultValues(product, categories),
  });
  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({ control, name: "colors", keyName: "fieldKey" });

  const colors = watch("colors");
  const images = watch("images");
  const originalPrice = watch("originalPrice");
  const price = watch("price");
  const costPrice = watch("costPrice");
  const published = watch("published");
  const margin = price > 0 && costPrice >= 0 ? Math.round(((price - costPrice) / price) * 100) : null;

  const addColor = () => {
    const sizes = colors[0]?.sizes.map((s) => ({ size: s.size, stock: 0 })) ?? [];
    appendColor({ name: "", hex: DEFAULT_HEX, sizes: sizes.length ? sizes : [{ size: "", stock: 0 }] });
  };

  // AI draft → form. "fill" leaves anything the admin already typed alone; "replace" (Regenerate)
  // overwrites every field the AI returned a value for. Blank AI values never clear a field.
  const applyAiDetails = useCallback(
    ({ suggestions: s }: AiProductAnalysis, mode: "fill" | "replace") => {
      const put = (name: Parameters<typeof setValue>[0], value: string) => {
        if (!value) return;
        if (mode === "fill" && getFieldState(name).isDirty) return;
        setValue(name, value as never, { shouldDirty: true, shouldValidate: true });
      };
      put("name", s.name);
      put("shortDescription", s.shortDescription);
      put("description", s.description);
      put("categoryId", s.categoryId);
      put("gender", s.gender);
      put("fabric", s.fabric);
      put("fit", s.fit);
      put("care", s.care);
      for (const key of productAttributeKeys) put(`attributes.${key}`, s.attributes[key] ?? "");
      // Colour: only fill a first colour that hasn't been named yet (renaming would move stock).
      const first = getValues("colors.0");
      if (s.color?.name && first && !first.name.trim() && !first.sizes.some((r) => r.id)) {
        setValue("colors.0.name", s.color.name, { shouldDirty: true, shouldValidate: true });
        if (s.color.hex) setValue("colors.0.hex", s.color.hex, { shouldDirty: true });
      }
    },
    [getFieldState, getValues, setValue],
  );

  const aiHints = useCallback(() => {
    const v = getValues();
    return {
      name: v.name,
      category: categories.find((c) => c.id === v.categoryId)?.name ?? "",
      gender: getFieldState("gender").isDirty ? v.gender : "",
      description: v.description.slice(0, 1000),
    };
  }, [categories, getFieldState, getValues]);

  const submit = handleSubmit(async (values) => {
    setSaveError(null);
    const input = toWrite(values, product);
    try {
      if (product) await dispatch(updateProduct({ id: product.id, input })).unwrap();
      else await dispatch(createProduct(input)).unwrap();
      onDone();
    } catch (err) {
      setSaveError(typeof err === "string" ? err : "Couldn't save the product.");
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      {saveError && (
        <div className="px-5 pt-6 sm:px-8">
          <FormAlert variant="error">{saveError}</FormAlert>
        </div>
      )}

      <Section
        title="Product images"
        description="Start with a clear photo of the product — AI drafts the details from it. Images are stored in Cloudflare."
      >
        <ProductImageUploader
          value={images}
          onChange={(urls) => setValue("images", urls, { shouldValidate: true, shouldDirty: true })}
          onUploadingChange={setUploading}
        />
        {errors.images && <p className="mt-2 text-xs font-medium text-red-500">{errors.images.message}</p>}
        <ProductAiAssistant
          imageUrl={images[0]}
          autoAnalyze={!product}
          onApplyDetails={applyAiDetails}
          getHints={aiHints}
          onBusyChange={setAiBusy}
          disabled={uploading}
        />
      </Section>

      <Section title="Product details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="name" label="Product name" error={errors.name?.message} required>
            <Input id="name" placeholder="e.g. Girls' Hanbok Party Dress" hasError={!!errors.name} {...register("name")} />
          </FormField>

          <FormField id="sku" label="SKU code" error={errors.sku?.message}>
            <Input
              id="sku"
              placeholder="e.g. FK-DRS-0012"
              autoCapitalize="characters"
              spellCheck={false}
              hasError={!!errors.sku}
              className="font-mono uppercase"
              {...register("sku")}
            />
          </FormField>

          <FormField id="categoryId" label="Category" error={errors.categoryId?.message} required>
            <Select id="categoryId" hasError={!!errors.categoryId} {...register("categoryId")}>
              <option value="">Select category</option>
              {categories
                .filter((c) => c.status === "active" || c.id === product?.categoryId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </FormField>

          <FormField id="subcategory" label="Subcategory" error={errors.subcategory?.message}>
            <Input id="subcategory" placeholder="e.g. Party wear" hasError={!!errors.subcategory} {...register("subcategory")} />
          </FormField>

          <FormField id="gender" label="Gender" error={errors.gender?.message} required>
            <Select id="gender" hasError={!!errors.gender} {...register("gender")}>
              {productGenders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="brandId" label="Brand" error={errors.brandId?.message}>
            <Select id="brandId" hasError={!!errors.brandId} {...register("brandId")}>
              <option value="">No brand</option>
              {brands
                .filter((b) => b.status === "active" || b.id === product?.brandId)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </Select>
          </FormField>

          <FormField id="tag" label="Website badge" error={errors.tag?.message}>
            <Select id="tag" hasError={!!errors.tag} {...register("tag")}>
              <option value="">None</option>
              {productTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="shortDescription" label="Short description" error={errors.shortDescription?.message}>
            <Input id="shortDescription" placeholder="One line shown on product cards" {...register("shortDescription")} />
          </FormField>
        </div>

        <FormField id="description" label="Description" error={errors.description?.message} className="mt-5">
          <textarea id="description" rows={4} className={textareaClass} {...register("description")} />
        </FormField>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField id="fabric" label="Fabric" error={errors.fabric?.message}>
            <Input id="fabric" placeholder="e.g. Cotton blend" {...register("fabric")} />
          </FormField>
          <FormField id="fit" label="Fit" error={errors.fit?.message}>
            <Input id="fit" placeholder="e.g. Regular fit" {...register("fit")} />
          </FormField>
          <FormField id="care" label="Care" error={errors.care?.message}>
            <Input id="care" placeholder="e.g. Hand-wash cold" {...register("care")} />
          </FormField>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ATTRIBUTE_FIELDS.map((f) => (
            <FormField key={f.key} id={`attributes.${f.key}`} label={f.label} error={errors.attributes?.[f.key]?.message}>
              <Input id={`attributes.${f.key}`} placeholder={f.placeholder} hasError={!!errors.attributes?.[f.key]} {...register(`attributes.${f.key}`)} />
            </FormField>
          ))}
        </div>
      </Section>


      <Section title="Pricing" description="Set once for the product. Every colour and size sells at these prices.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField id="originalPrice" label="MRP (₹)" error={errors.originalPrice?.message} required>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              min="0"
              hasError={!!errors.originalPrice}
              {...register("originalPrice", { valueAsNumber: true })}
            />
          </FormField>
          <FormField id="price" label="Selling price (₹)" error={errors.price?.message} required>
            <Input id="price" type="number" step="0.01" min="0" hasError={!!errors.price} {...register("price", { valueAsNumber: true })} />
          </FormField>
          <FormField id="costPrice" label="Cost price (₹)" error={errors.costPrice?.message} required>
            <Input id="costPrice" type="number" step="0.01" min="0" hasError={!!errors.costPrice} {...register("costPrice", { valueAsNumber: true })} />
          </FormField>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
          <span className="flex items-center gap-2">
            Customer sees
            {price > 0 ? <PriceDisplay price={price} originalPrice={originalPrice} /> : <span>—</span>}
          </span>
          {margin !== null && <span>Margin {margin}%</span>}
        </div>
      </Section>

      <Section
        title="Colours & sizes"
        description="Add each colour, then its sizes and stock. Every colour and size gets its own barcode. Leave stock empty if you don't track it."
      >
        <datalist id="product-size-suggestions">
          {productSizeSuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <div className="flex flex-col gap-4">
          {colorFields.map((field, index) => (
            <ColorBlock
              key={field.fieldKey}
              index={index}
              control={control}
              register={register}
              errors={errors}
              barcodes={barcodes}
              sizesInUse={colors[index]?.sizes.map((s) => s.size) ?? []}
              canRemove={colorFields.length > 1}
              onRemove={() => removeColor(index)}
            />
          ))}
        </div>
        {errors.colors?.message && <p className="mt-2 text-xs font-medium text-red-500">{errors.colors.message}</p>}
        <Button type="button" variant="secondary" onClick={addColor} className="mt-4">
          <HiOutlinePlus className="h-5 w-5" />
          Add colour
        </Button>

        <FormField id="reorderLevel" label="Low-stock alert at (total units)" error={errors.reorderLevel?.message} className="mt-6 sm:max-w-xs">
          <Input id="reorderLevel" type="number" min="0" hasError={!!errors.reorderLevel} {...register("reorderLevel", { valueAsNumber: true })} />
        </FormField>
      </Section>

      <Section title="Website">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-glass-border bg-white/40 p-4">
          <div>
            <p className="text-sm font-medium text-ink">Published on website</p>
            <p className="mt-0.5 text-sm text-ink-muted">
              {published ? "Shoppers can see and buy this product." : "Hidden from the website."} Turns off automatically when stock runs out.
            </p>
          </div>
          <Switch checked={published} label="Published on website" onCheckedChange={(on) => setValue("published", on, { shouldDirty: true })} />
        </div>
      </Section>

      <div className="sticky bottom-0 mt-auto flex gap-3 border-t border-glass-border bg-cream-50 px-5 py-4 shadow-[0_-8px_24px_-16px_rgba(43,36,29,0.25)] sm:justify-end sm:px-8 max-sm:[&>button]:flex-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="max-sm:hidden">
          Cancel
        </Button>
        {aiBusy && <span className="self-center text-xs text-ink-muted max-sm:hidden">Waiting for AI to finish…</span>}
        <Button type="submit" disabled={uploading || aiBusy} isLoading={isSubmitting}>
          {product ? "Save Changes" : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
