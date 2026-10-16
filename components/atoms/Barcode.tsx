"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { isValidEan13 } from "@/lib/barcode";

export interface BarcodeProps {
  value: string;
  height?: number;
  width?: number;
  displayValue?: boolean;
  className?: string;
}

export function Barcode({ value, height = 32, width = 1.4, displayValue = false, className }: BarcodeProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    JsBarcode(ref.current, value, {
      format: isValidEan13(value) ? "EAN13" : "CODE128",
      height,
      width,
      margin: 2,
      displayValue,
      fontSize: 16,
      background: "transparent",
    });
  }, [value, height, width, displayValue]);

  if (!value) return null;

  return <svg ref={ref} className={className} role="img" aria-label={`Barcode ${value}`} />;
}
