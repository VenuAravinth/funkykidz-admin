"use client";

import { useState } from "react";
import { HiOutlineArrowDownTray, HiOutlineArrowPath, HiOutlinePrinter } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Barcode } from "@/components/atoms/Barcode";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { useBarcodePrinter } from "@/components/organisms/BarcodePrintSheet";
import { formatCurrency } from "@/lib/format";
import { sellableUnits } from "@/lib/barcode";
import { downloadBarcodeLabels } from "@/lib/barcodeImage";
import { regenerateProductBarcodes } from "@/features/products/api";
import { useAppDispatch } from "@/stores/hooks";
import type { Product } from "@/types/product";

const stockText = (stock: number | null) => (stock === null ? "Not tracked" : `${stock} in stock`);

export function ProductBarcodeModal({ product, onClose }: { product?: Product; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const { print, sheet } = useBarcodePrinter();
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const units = product ? sellableUnits(product) : [];
  const single = units.length === 1;
  const fileName = product?.slug ?? "product";

  const regenerate = async () => {
    setConfirmRegenerate(false);
    if (!product) return;
    setError(null);
    try {
      await dispatch(regenerateProductBarcodes({ id: product.id })).unwrap();
    } catch (err) {
      setError(typeof err === "string" ? err : "Couldn't regenerate barcodes.");
    }
  };

  return (
    <>
      <Modal
        open={!!product}
        onClose={onClose}
        size={single ? "md" : "lg"}
        title={single ? "Barcode" : `Barcodes · ${units.length} colours & sizes`}
        subtitle={product?.name}
      >
        {product && (
          <div className="flex flex-col gap-5">
            {error && <FormAlert variant="error">{error}</FormAlert>}
            <div className={single ? "" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
              {units.map((unit) => (
                <div key={unit.key} className="flex flex-col items-center gap-1 rounded-2xl border border-glass-border bg-white px-4 py-4 text-center">
                  <p className="max-w-full truncate text-sm font-semibold text-ink">{unit.variantLabel}</p>
                  <p className="text-xs text-ink-muted">
                    {formatCurrency(unit.price)} · {stockText(unit.stock)}
                  </p>
                  <Barcode value={unit.barcode} height={single ? 90 : 60} width={single ? 2.4 : 1.8} displayValue className="mt-1 h-auto w-full max-w-xs" />
                  {!single && (
                    <div className="mt-1 flex gap-1">
                      <IconButton label={`Download barcode for ${unit.variantLabel}`} title="Download" onClick={() => downloadBarcodeLabels([unit], fileName)}>
                        <HiOutlineArrowDownTray className="h-4.5 w-4.5" />
                      </IconButton>
                      <IconButton label={`Print barcode for ${unit.variantLabel}`} title="Print" onClick={() => print([unit])}>
                        <HiOutlinePrinter className="h-4.5 w-4.5" />
                      </IconButton>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-ink-muted">
              Each colour and size has its own barcode. Barcodes stay the same when price or stock changes. Labels print at the size set in
              Barcode / Labels → Settings.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <Button variant="ghost" onClick={() => setConfirmRegenerate(true)} className="sm:mr-auto">
                <HiOutlineArrowPath className="h-5 w-5" />
                Regenerate
              </Button>
              <Button variant="secondary" onClick={() => print(units)}>
                <HiOutlinePrinter className="h-5 w-5" />
                {single ? "Print" : "Print all"}
              </Button>
              <Button onClick={() => downloadBarcodeLabels(units, fileName)}>
                <HiOutlineArrowDownTray className="h-5 w-5" />
                {single ? "Download PNG" : "Download all"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {sheet}

      <ConfirmDialog
        open={confirmRegenerate}
        title="Regenerate barcodes?"
        description={`Every colour and size of ${product?.name ?? "this product"} gets a new barcode and the current ones stop working — any labels already printed must be replaced.`}
        confirmLabel="Regenerate"
        onCancel={() => setConfirmRegenerate(false)}
        onConfirm={regenerate}
      />
    </>
  );
}
