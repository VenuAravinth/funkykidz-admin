"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ProductQuickViewModal } from "@/components/organisms/ProductQuickViewModal";
import { findByCode } from "@/lib/barcode";
import { useAppSelector } from "@/stores/hooks";
import { selectProducts } from "@/stores/slices/catalogSlice";

const MAX_KEY_GAP_MS = 50;
const MIN_CODE_LENGTH = 6;

const OWN_SCAN_HANDLING = ["/sales/pos", "/inventory/barcode-labels/scan"];

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function BarcodeScanListener() {
  const pathname = usePathname();
  const products = useAppSelector(selectProducts);
  const [scanned, setScanned] = useState("");
  const buffer = useRef({ chars: "", last: 0 });
  const disabled = OWN_SCAN_HANDLING.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (disabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditable(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      const now = performance.now();
      const b = buffer.current;
      if (now - b.last > MAX_KEY_GAP_MS) b.chars = "";
      b.last = now;

      if (e.key === "Enter") {
        if (b.chars.length >= MIN_CODE_LENGTH) {
          e.preventDefault();
          setScanned(b.chars);
        }
        b.chars = "";
      } else if (e.key.length === 1) {
        b.chars += e.key;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled]);

  if (!scanned) return null;
  return <ProductQuickViewModal code={scanned} match={findByCode(scanned, products)} onClose={() => setScanned("")} />;
}
