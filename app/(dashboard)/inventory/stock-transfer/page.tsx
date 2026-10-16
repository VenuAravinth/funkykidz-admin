"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlineArrowDown } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { Select } from "@/components/atoms/Select";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { stockTransferSchema, transferReasons, type StockTransferInput } from "@/features/stock-transfer/schema";
import { formatDateTime } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectProducts } from "@/stores/slices/catalogSlice";
import { selectAuthUser } from "@/stores/slices/authSlice";
import {
  advanceTransfer,
  createTransfer,
  selectLocations,
  selectStockByLocation,
  selectTransfers,
} from "@/stores/slices/transfersSlice";
import { transferStatuses, type TransferStatus } from "@/types/transfer";

const NEXT_ACTION_LABEL: Record<TransferStatus, string | null> = {
  draft: "Request Transfer",
  requested: "Approve",
  approved: "Mark In Transit",
  in_transit: "Mark Received",
  received: "Complete",
  completed: null,
};

function nextStatus(current: TransferStatus): TransferStatus | null {
  const idx = transferStatuses.indexOf(current);
  return idx >= 0 && idx < transferStatuses.length - 1 ? transferStatuses[idx + 1] : null;
}

export default function StockTransferPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const locations = useAppSelector(selectLocations);
  const stockByLocation = useAppSelector(selectStockByLocation);
  const transferList = useAppSelector(selectTransfers);
  const authUser = useAppSelector(selectAuthUser);

  const activeProducts = products;
  const locationById = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const [justCreated, setJustCreated] = useState(false);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<StockTransferInput>({
    resolver: zodResolver(stockTransferSchema),
    defaultValues: {
      fromLocationId: locations[0]?.id ?? "",
      toLocationId: "",
      productId: "",
      quantity: 1,
      reason: transferReasons[0],
    },
  });

  const fromLocationId = watch("fromLocationId");
  const toLocationId = watch("toLocationId");
  const productId = watch("productId");
  const quantity = watch("quantity") || 0;

  const available = productId && fromLocationId ? stockByLocation[productId]?.[fromLocationId] ?? 0 : 0;
  const destinationBefore = productId && toLocationId ? stockByLocation[productId]?.[toLocationId] ?? 0 : 0;

  const onSubmit = handleSubmit((values) => {
    if (values.quantity > available) {
      setError("quantity", { type: "manual", message: `Only ${available} unit(s) available at the source location.` });
      return;
    }
    dispatch(
      createTransfer({
        ...values,
        requestedBy: authUser?.name ?? "Demo User",
      }),
    );
    reset({ ...values, productId: "", quantity: 1 });
    setJustCreated(true);
    setTimeout(() => setJustCreated(false), 3000);
  });

  const handleAdvance = (transferId: string, current: TransferStatus) => {
    const to = nextStatus(current);
    if (!to) return;
    dispatch(advanceTransfer({ id: transferId, to, by: authUser?.name ?? "Demo User" }));
  };

  return (
    <div>
      <PageHeader
        title="Stock Transfer"
        subtitle="Move stock between locations — useful once Funky Kids has multiple shops, branches, or warehouses."
        backHref="/inventory"
        backLabel="Inventory"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-6">
          <h2 className="mb-5 text-sm font-semibold text-ink">Create Transfer</h2>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            {justCreated && <FormAlert variant="success">Transfer created as a draft — ready to progress below.</FormAlert>}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField id="fromLocationId" label="From Location" error={errors.fromLocationId?.message} required>
                <Select
                  id="fromLocationId"
                  hasError={!!errors.fromLocationId}
                  {...register("fromLocationId", { onChange: () => setValue("toLocationId", "") })}
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField id="toLocationId" label="To Location" error={errors.toLocationId?.message} required>
                <Select id="toLocationId" hasError={!!errors.toLocationId} {...register("toLocationId")}>
                  <option value="">Select a destination…</option>
                  {locations
                    .filter((loc) => loc.id !== fromLocationId)
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                </Select>
              </FormField>
            </div>

            <FormField id="productId" label="Product" error={errors.productId?.message} required>
              <Select id="productId" hasError={!!errors.productId} {...register("productId")}>
                <option value="">Select a product…</option>
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField id="quantity" label="Transfer Quantity" error={errors.quantity?.message} required>
              <Input id="quantity" type="number" min={1} hasError={!!errors.quantity} {...register("quantity", { valueAsNumber: true })} />
            </FormField>

            <FormField id="reason" label="Reason" error={errors.reason?.message} required>
              <Select id="reason" hasError={!!errors.reason} {...register("reason")}>
                {transferReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </FormField>

            <div>
              <Button type="submit">Create Transfer</Button>
            </div>
          </form>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col items-center gap-2 p-6 text-center">
            <p className="text-base font-semibold text-ink">{locationById.get(fromLocationId)?.name ?? "—"}</p>
            <HiOutlineArrowDown className="h-5 w-5 text-champagne-600" />
            <p className="text-sm font-medium text-ink-muted">Transfer {quantity || 0}</p>
            <HiOutlineArrowDown className="h-5 w-5 text-champagne-600" />
            <p className="text-base font-semibold text-ink">{toLocationId ? locationById.get(toLocationId)?.name : "—"}</p>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-ink">Stock calculation</h2>
            {productId && toLocationId ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Before Transfer</p>
                    <p className="text-ink">
                      {locationById.get(fromLocationId)?.name}: <span className="font-semibold">{available}</span>
                    </p>
                    <p className="text-ink">
                      {locationById.get(toLocationId)?.name}: <span className="font-semibold">{destinationBefore}</span>
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">After Transfer</p>
                    <p className="text-ink">
                      {locationById.get(fromLocationId)?.name}: <span className="font-semibold">{available - quantity}</span>
                    </p>
                    <p className="text-ink">
                      {locationById.get(toLocationId)?.name}: <span className="font-semibold">{destinationBefore + quantity}</span>
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-ink-muted">
                  No new purchase is created — the total company-wide stock is unchanged, only redistributed: Transfer Out −
                  {quantity || 0}, Transfer In +{quantity || 0}.
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-muted">Select a product and destination to see the before/after breakdown.</p>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-ink">Transfers</h2>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Transfer #</Th>
              <Th>Product</Th>
              <Th>From → To</Th>
              <Th>Quantity</Th>
              <Th>Reason</Th>
              <Th>Status</Th>
              <Th>Requested By</Th>
              <Th className="text-right">Action</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {transferList.length === 0 && <TableEmpty colSpan={8} message="No stock transfers yet." />}
            {transferList.map((transfer) => {
              const actionLabel = NEXT_ACTION_LABEL[transfer.status];
              return (
                <TableRow key={transfer.id}>
                  <Td className="font-medium text-ink">{transfer.transferNumber}</Td>
                  <Td>{productById.get(transfer.productId)?.name ?? "—"}</Td>
                  <Td>
                    {locationById.get(transfer.fromLocationId)?.name ?? "—"} →{" "}
                    {locationById.get(transfer.toLocationId)?.name ?? "—"}
                  </Td>
                  <Td>{transfer.quantity}</Td>
                  <Td>{transfer.reason}</Td>
                  <Td>
                    <StatusBadge status={transfer.status} />
                  </Td>
                  <Td className="text-ink-muted">
                    {transfer.requestedBy}
                    <div className="text-xs">{formatDateTime(transfer.createdAt)}</div>
                  </Td>
                  <Td className="text-right">
                    {actionLabel && (
                      <Button variant="secondary" size="sm" onClick={() => handleAdvance(transfer.id, transfer.status)}>
                        {actionLabel}
                      </Button>
                    )}
                  </Td>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
