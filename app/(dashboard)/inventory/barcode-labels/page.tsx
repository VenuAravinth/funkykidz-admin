"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlinePrinter, HiOutlineSparkles } from "react-icons/hi2";
import { Card } from "@/components/atoms/Card";
import { Select } from "@/components/atoms/Select";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { LabelPreview, type LabelData } from "@/components/organisms/LabelPreview";
import { generateBarcodeSchema, type GenerateBarcodeInput } from "@/features/barcode-labels/schema";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectProducts, selectVariants } from "@/stores/slices/catalogSlice";
import { variantLabel } from "@/types/product";
import { generateBarcodeBatch, selectBarcodeSettings } from "@/stores/slices/barcodeSlice";
import { selectAuthUser } from "@/stores/slices/authSlice";

function GenerateBarcodeContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const products = useAppSelector(selectProducts);
  const variants = useAppSelector(selectVariants);
  const settings = useAppSelector(selectBarcodeSettings);
  const authUser = useAppSelector(selectAuthUser);

  const barcodeParam = searchParams.get("barcode");
  const preselected = useMemo(() => {
    const variant = barcodeParam ? variants.find((v) => v.barcode === barcodeParam) : undefined;
    return variant ? { productId: variant.productId, variantId: variant.id } : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcodeParam]);

  const [generatedId, setGeneratedId] = useState<string | undefined>(undefined);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateBarcodeInput>({
    resolver: zodResolver(generateBarcodeSchema),
    defaultValues: {
      productId: preselected?.productId ?? "",
      variantId: preselected?.variantId ?? "",
      quantity: settings.defaultQuantity,
    },
  });

  const productId = watch("productId");
  const variantId = watch("variantId");

  const product = products.find((p) => p.id === productId);
  const productVariants = product?.variants ?? [];
  const variant = productVariants.find((v) => v.id === variantId);

  const labelData: LabelData | undefined =
    product && variant
      ? { productName: product.name, size: variant.size, color: variant.color, price: product.price, barcode: variant.barcode }
      : undefined;

  const onSubmit = handleSubmit((values) => {
    if (!product || !variant) return;
    const action = dispatch(
      generateBarcodeBatch({
        productId: product.id,
        variantId: variant.id,
        barcode: variant.barcode,
        quantity: values.quantity,
        generatedBy: authUser?.name ?? "Demo User",
      }),
    );
    setGeneratedId(action.payload.id);
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card className="p-6">
        <h2 className="mb-5 text-sm font-semibold text-ink">Select product</h2>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <FormField id="productId" label="Product" error={errors.productId?.message} required>
            <Select
              id="productId"
              hasError={!!errors.productId}
              {...register("productId", { onChange: () => setValue("variantId", "") })}
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="variantId" label="Colour & size" error={errors.variantId?.message} required>
            <Select id="variantId" hasError={!!errors.variantId} disabled={!product} {...register("variantId")}>
              <option value="">{product ? "Select colour and size…" : "Select a product first"}</option>
              {productVariants.map((v) => (
                <option key={v.id} value={v.id}>
                  {variantLabel(v)} ({v.barcode})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="quantity" label="Quantity" error={errors.quantity?.message} required>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={500}
              hasError={!!errors.quantity}
              {...register("quantity", { valueAsNumber: true })}
            />
          </FormField>

          {generatedId && (
            <FormAlert variant="success">
              {watch("quantity")} label(s) generated for {variant ? variantLabel(variant) : "this product"}.
            </FormAlert>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit">
              <HiOutlineSparkles className="h-4 w-4" />
              Generate
            </Button>
            {generatedId && (
              <Link href={`/inventory/barcode-labels/print?batchId=${generatedId}`}>
                <Button type="button" variant="secondary">
                  <HiOutlinePrinter className="h-4 w-4" />
                  Print Labels
                </Button>
              </Link>
            )}
          </div>
        </form>
      </Card>

      <Card className="flex flex-col items-center gap-4 p-6">
        <h2 className="self-start text-sm font-semibold text-ink">Label preview</h2>
        {labelData ? (
          <LabelPreview data={labelData} settings={settings} />
        ) : (
          <p className="py-12 text-sm text-ink-muted">Select a product, colour and size to preview its label.</p>
        )}
      </Card>
    </div>
  );
}

export default function GenerateBarcodePage() {
  return (
    <Suspense fallback={null}>
      <GenerateBarcodeContent />
    </Suspense>
  );
}
