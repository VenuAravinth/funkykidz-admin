"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HiOutlinePrinter } from "react-icons/hi2";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { LabelPreview, type LabelData } from "@/components/organisms/LabelPreview";
import { formatDateTime } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectProducts, selectVariants } from "@/stores/slices/catalogSlice";
import { selectBarcodeHistory, selectBarcodeSettings } from "@/stores/slices/barcodeSlice";

function PrintLabelsContent() {
  const searchParams = useSearchParams();
  const history = useAppSelector(selectBarcodeHistory);
  const products = useAppSelector(selectProducts);
  const variants = useAppSelector(selectVariants);
  const settings = useAppSelector(selectBarcodeSettings);

  const preselectId = searchParams.get("batchId");
  const [selected, setSelected] = useState<Set<string>>(new Set(preselectId ? [preselectId] : []));

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const variantById = useMemo(() => new Map(variants.map((v) => [v.id, v])), [variants]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedBatches = history.filter((b) => selected.has(b.id));
  const totalLabels = selectedBatches.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex items-center justify-between">
        <p className="text-sm text-ink-muted">Select generated batches to print.</p>
        <Button disabled={selectedBatches.length === 0} onClick={() => window.print()}>
          <HiOutlinePrinter className="h-4 w-4" />
          Print Selected ({totalLabels} label{totalLabels === 1 ? "" : "s"})
        </Button>
      </div>

      <div className="no-print">
        <Table paginate={false}>
          <TableHead>
            <TableRow>
              <Th></Th>
              <Th>Product</Th>
              <Th>Variant</Th>
              <Th>Barcode</Th>
              <Th>Quantity</Th>
              <Th>Generated</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.length === 0 && <TableEmpty colSpan={6} message="No barcode batches generated yet." />}
            {history.map((batch) => {
              const product = productById.get(batch.productId);
              const variant = batch.variantId ? variantById.get(batch.variantId) : undefined;
              return (
                <TableRow key={batch.id}>
                  <Td>
                    <Checkbox
                      checked={selected.has(batch.id)}
                      onChange={() => toggle(batch.id)}
                      aria-label={`Select batch for ${product?.name ?? batch.barcode}`}
                    />
                  </Td>
                  <Td className="font-medium text-ink">{product?.name ?? "—"}</Td>
                  <Td>{variant ? `${variant.size} · ${variant.color}` : "—"}</Td>
                  <Td className="text-ink-muted">{batch.barcode}</Td>
                  <Td>{batch.quantity}</Td>
                  <Td className="text-ink-muted">
                    {formatDateTime(batch.generatedAt)} · {batch.generatedBy}
                  </Td>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedBatches.length > 0 && (
        <Card className="no-print p-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">Preview</h2>
          <div className="flex flex-wrap gap-3">
            {selectedBatches.map((batch) => {
              const product = productById.get(batch.productId);
              const variant = batch.variantId ? variantById.get(batch.variantId) : undefined;
              if (!product) return null;
              const data: LabelData = {
                productName: product.name,
                size: variant?.size,
                color: variant?.color,
                price: product.price,
                barcode: variant?.barcode ?? batch.barcode,
              };
              return <LabelPreview key={batch.id} data={data} settings={settings} scale={2} />;
            })}
          </div>
        </Card>
      )}

      <div className="print-area hidden print:block">
        <div className="flex flex-wrap gap-2">
          {selectedBatches.map((batch) => {
            const product = productById.get(batch.productId);
            const variant = batch.variantId ? variantById.get(batch.variantId) : undefined;
            if (!product) return null;
            const data: LabelData = {
              productName: product.name,
              size: variant?.size,
              color: variant?.color,
              price: product.price,
              barcode: variant?.barcode ?? batch.barcode,
            };
            return Array.from({ length: batch.quantity }, (_, i) => (
              <LabelPreview key={`${batch.id}-${i}`} data={data} settings={settings} scale={1} />
            ));
          })}
        </div>
      </div>
    </div>
  );
}

export default function PrintLabelsPage() {
  return (
    <Suspense fallback={null}>
      <PrintLabelsContent />
    </Suspense>
  );
}
