"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goodsReceiptSchema, type GoodsReceiptInput } from "@/features/goods-received/schema";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/atoms/Table";
import type { PurchaseOrder } from "@/types/supplier";

export function ReceiveStockForm({ po }: { po: PurchaseOrder }) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoodsReceiptInput>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      receiptType: "full",
      receivedDate: new Date().toISOString().slice(0, 10),
      receivedBy: "",
      remarks: "",
      items: po.items.map((item) => ({
        description: item.description,
        orderedQty: item.quantity - item.receivedQuantity,
        receivedQty: item.quantity - item.receivedQuantity,
        damagedQty: 0,
        missingQty: 0,
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: "items" });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(true);
    setTimeout(() => router.push("/goods-received?view=full"), 900);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {submitted && (
        <FormAlert variant="success">Goods receipt logged successfully. (Demo only — changes aren&apos;t persisted.)</FormAlert>
      )}

      <div className="rounded-xl border border-glass-border bg-white/40 p-4 text-sm">
        <p className="font-medium text-ink">
          {po.poNumber} · {po.supplierName}
        </p>
        <p className="text-ink-muted">Expected delivery: {po.expectedDeliveryDate}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <FormField id="receiptType" label="Receipt type" error={errors.receiptType?.message} required>
          <Select id="receiptType" hasError={!!errors.receiptType} {...register("receiptType")}>
            <option value="full">Full Receive</option>
            <option value="partial">Partial Receive</option>
            <option value="damaged">Damaged / Missing Items</option>
          </Select>
        </FormField>

        <FormField id="receivedDate" label="Received date" error={errors.receivedDate?.message} required>
          <Input id="receivedDate" type="date" hasError={!!errors.receivedDate} {...register("receivedDate")} />
        </FormField>

        <FormField id="receivedBy" label="Received by" error={errors.receivedBy?.message} required>
          <Input id="receivedBy" placeholder="e.g. Warehouse — Ramesh K." hasError={!!errors.receivedBy} {...register("receivedBy")} />
        </FormField>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink">Items</h2>
        <Table paginate={false}>
          <TableHead>
            <TableRow>
              <Th>Description</Th>
              <Th>Ordered</Th>
              <Th>Received Qty</Th>
              <Th>Damaged Qty</Th>
              <Th>Missing Qty</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <Td>{field.description}</Td>
                <Td>{field.orderedQty}</Td>
                <Td className="w-28">
                  <Input type="number" min={0} {...register(`items.${index}.receivedQty`, { valueAsNumber: true })} />
                </Td>
                <Td className="w-28">
                  <Input type="number" min={0} {...register(`items.${index}.damagedQty`, { valueAsNumber: true })} />
                </Td>
                <Td className="w-28">
                  <Input type="number" min={0} {...register(`items.${index}.missingQty`, { valueAsNumber: true })} />
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FormField id="remarks" label="Remarks">
        <textarea
          id="remarks"
          rows={3}
          placeholder="Optional remarks about this receipt…"
          className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
          {...register("remarks")}
        />
      </FormField>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Log Receipt
        </Button>
      </div>
    </form>
  );
}
