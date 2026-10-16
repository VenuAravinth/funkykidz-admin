"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LabelPreview } from "@/components/organisms/LabelPreview";
import type { SellableUnit } from "@/lib/barcode";
import { useAppSelector } from "@/stores/hooks";
import { selectBarcodeSettings } from "@/stores/slices/barcodeSlice";

export function useBarcodePrinter() {
  const [units, setUnits] = useState<SellableUnit[] | null>(null);
  const settings = useAppSelector(selectBarcodeSettings);

  useEffect(() => {
    if (!units) return;
    const done = () => setUnits(null);
    window.addEventListener("afterprint", done, { once: true });
    const timer = window.setTimeout(() => window.print(), 150);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", done);
    };
  }, [units]);

  const sheet =
    units &&
    createPortal(
      <div className="print-area hidden flex-wrap content-start gap-[2mm] p-[4mm] print:flex">
        {units.map((unit) => (
          <LabelPreview
            key={unit.key}
            scale={1}
            settings={settings}
            data={{
              productName: unit.productName,
              size: unit.variantLabel,
              price: unit.price,
              barcode: unit.barcode,
            }}
          />
        ))}
      </div>,
      document.body,
    );

  return { print: setUnits, sheet };
}
