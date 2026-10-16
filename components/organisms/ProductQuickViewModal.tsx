"use client";

import Link from "next/link";
import { Modal } from "@/components/molecules/Modal";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { ProductTagBadges } from "@/components/molecules/ProductTagBadges";
import { ProductThumbnail } from "@/components/molecules/ProductThumbnail";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { useSignedImageUrls } from "@/features/products/useSignedImageUrls";
import type { CodeMatch } from "@/lib/barcode";
import { useAppSelector } from "@/stores/hooks";
import { selectCategoryById } from "@/stores/slices/catalogSlice";

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

export function ProductQuickViewModal({ code, match, onClose }: { code: string; match?: CodeMatch; onClose: () => void }) {
  const product = match?.product;
  const variant = match?.variant;
  const category = useAppSelector((state) => (product ? selectCategoryById(state, product.categoryId) : undefined));
  const primary = product?.images[0];
  const { signed } = useSignedImageUrls(primary ? [primary] : []);
  const stock = variant?.stock ?? null;

  return (
    <Modal open={!!code} onClose={onClose} title={product ? "Scanned product" : "Barcode not recognised"} subtitle={`Scanned: ${code}`}>
      {!product ? (
        <p className="text-sm text-ink-muted">No product uses this barcode. Check the label, or the product may have been deleted or its barcode regenerated.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex gap-4">
            <ProductThumbnail src={primary ? signed[primary] : undefined} alt={product.name} className="h-20 w-20" />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-ink">{product.name}</p>
              <PriceDisplay price={product.price} originalPrice={product.originalPrice} className="mt-1" />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {stock === null ? <Badge>Not tracked</Badge> : stock <= 0 ? <Badge tone="danger">Out of stock</Badge> : <Badge>{stock} in stock</Badge>}
                <Badge tone={product.published ? "success" : "neutral"}>{product.published ? "On website" : "Not on website"}</Badge>
                <ProductTagBadges tag={product.tag} />
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
            <Detail label="Colour" value={variant?.color} />
            <Detail label="Size" value={variant?.size} />
            <Detail label="Barcode" value={variant?.barcode} />
            <Detail label="Category" value={category?.name ?? product.category} />
            <Detail label="Brand" value={product.brand} />
            <Detail label="Gender" value={product.gender} />
          </dl>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link href={`/inventory/stock-adjustment`} onClick={onClose}>
              <Button variant="secondary" fullWidth>
                Adjust stock
              </Button>
            </Link>
            <Link href={`/inventory/products/${product.id}`} onClick={onClose}>
              <Button fullWidth>View product</Button>
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
