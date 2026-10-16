"use client";

import { useState } from "react";
import { Switch } from "@/components/atoms/Switch";
import { setProductPublished } from "@/features/products/api";
import { useAppDispatch } from "@/stores/hooks";
import type { Product } from "@/types/product";

export interface ProductPublishSwitchProps {
  product: Product;
  onError?: (message: string) => void;
}

export function ProductPublishSwitch({ product, onError }: ProductPublishSwitchProps) {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);
  const blocked = !product.published && !product.inStock;

  const toggle = async (published: boolean) => {
    setBusy(true);
    try {
      await dispatch(setProductPublished({ id: product.id, published })).unwrap();
    } catch (err) {
      onError?.(typeof err === "string" ? err : "Couldn't change the publish status.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Switch
      checked={product.published}
      onCheckedChange={toggle}
      busy={busy}
      disabled={blocked}
      label={`${product.published ? "Unpublish" : "Publish"} ${product.name}`}
      title={blocked ? "Out of stock — add stock to publish" : product.published ? "Published on website" : "Hidden from website"}
    />
  );
}
