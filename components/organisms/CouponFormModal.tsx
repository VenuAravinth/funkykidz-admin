"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, type CouponInput } from "@/features/coupons/schema";
import { Modal } from "@/components/molecules/Modal";
import { FormField } from "@/components/molecules/FormField";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { useAppDispatch } from "@/stores/hooks";
import { addCoupon, updateCoupon } from "@/stores/slices/onlineStoreSlice";
import { couponConditionTypes, discountTypes, type Coupon } from "@/types/onlineStore";

const emptyValues: CouponInput = {
  code: "",
  discountType: "Percentage",
  discountValue: 10,
  minimumOrder: undefined,
  maximumDiscount: undefined,
  usageLimit: undefined,
  perCustomerLimit: 1,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  onlineOnly: true,
  allowPos: false,
  conditions: [],
};

function toDefaultValues(coupon?: Coupon): CouponInput {
  if (!coupon) return emptyValues;
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minimumOrder: coupon.minimumOrder,
    maximumDiscount: coupon.maximumDiscount,
    usageLimit: coupon.usageLimit,
    perCustomerLimit: coupon.perCustomerLimit,
    startDate: coupon.startDate,
    endDate: coupon.endDate,
    onlineOnly: coupon.onlineOnly,
    allowPos: coupon.allowPos,
    conditions: coupon.conditions,
  };
}

export function CouponFormModal({ open, coupon, onClose }: { open: boolean; coupon?: Coupon; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const mode = coupon ? "edit" : "create";
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: toDefaultValues(coupon),
  });

  useEffect(() => {
    if (open) reset(toDefaultValues(coupon));
  }, [open, coupon, reset]);

  const conditions = watch("conditions");

  const toggleCondition = (condition: (typeof couponConditionTypes)[number]) => {
    const next = conditions.includes(condition) ? conditions.filter((c) => c !== condition) : [...conditions, condition];
    setValue("conditions", next);
  };

  const onSubmit = handleSubmit((input) => {
    if (coupon) {
      dispatch(updateCoupon({ id: coupon.id, input }));
    } else {
      dispatch(addCoupon(input));
    }
    onClose();
  });

  return (
    <Modal size="lg"
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create Coupon" : "Edit Coupon"}
      subtitle={mode === "create" ? "Set up a new online discount code." : coupon?.code}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField id="coupon-code" label="Coupon code" error={errors.code?.message} required>
          <Input id="coupon-code" placeholder="e.g. KIDS10" hasError={!!errors.code} {...register("code")} />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="coupon-discountType" label="Discount type" required>
            <Select id="coupon-discountType" {...register("discountType")}>
              {discountTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="coupon-discountValue" label="Discount" error={errors.discountValue?.message} required>
            <Input
              id="coupon-discountValue"
              type="number"
              min={0}
              hasError={!!errors.discountValue}
              {...register("discountValue", { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="coupon-minimumOrder" label="Minimum order (₹)">
            <Input id="coupon-minimumOrder" type="number" min={0} {...register("minimumOrder", { valueAsNumber: true })} />
          </FormField>
          <FormField id="coupon-maximumDiscount" label="Maximum discount (₹)">
            <Input id="coupon-maximumDiscount" type="number" min={0} {...register("maximumDiscount", { valueAsNumber: true })} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="coupon-usageLimit" label="Usage limit">
            <Input id="coupon-usageLimit" type="number" min={1} {...register("usageLimit", { valueAsNumber: true })} />
          </FormField>
          <FormField id="coupon-perCustomerLimit" label="Per customer">
            <Input id="coupon-perCustomerLimit" type="number" min={1} {...register("perCustomerLimit", { valueAsNumber: true })} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="coupon-startDate" label="Start date" error={errors.startDate?.message} required>
            <Input id="coupon-startDate" type="date" hasError={!!errors.startDate} {...register("startDate")} />
          </FormField>
          <FormField id="coupon-endDate" label="End date" error={errors.endDate?.message} required>
            <Input id="coupon-endDate" type="date" hasError={!!errors.endDate} {...register("endDate")} />
          </FormField>
        </div>

        <div className="flex flex-wrap gap-4">
          <CheckboxField id="coupon-onlineOnly" label="Online only" {...register("onlineOnly")} />
          <CheckboxField id="coupon-allowPos" label="Allow on POS" {...register("allowPos")} />
        </div>

        <FormField id="coupon-conditions" label="Conditions">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {couponConditionTypes.map((condition) => (
              <CheckboxField
                key={condition}
                id={`coupon-condition-${condition}`}
                label={condition}
                checked={conditions.includes(condition)}
                onChange={() => toggleCondition(condition)}
              />
            ))}
          </div>
        </FormField>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{mode === "create" ? "Create Coupon" : "Save Changes"}</Button>
        </div>
      </form>
    </Modal>
  );
}
