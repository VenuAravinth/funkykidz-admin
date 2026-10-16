"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Drawer } from "@/components/molecules/Drawer";
import { ProductForm } from "@/components/organisms/ProductForm";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Spinner } from "@/components/atoms/Spinner";
import { fetchProduct } from "@/features/products/api";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectProductById } from "@/stores/slices/catalogSlice";

export function useProductFormLinks() {
  const pathname = usePathname();
  return {
    newHref: `${pathname}?new=1`,
    editHref: (id: string) => `${pathname}?edit=${encodeURIComponent(id)}`,
  };
}

export function ProductFormDrawer() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [failed, setFailed] = useState<{ id: string; message: string } | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isNew = searchParams.get("new") === "1";
  const product = useAppSelector((state) => (editId ? selectProductById(state, editId) : undefined));
  const open = isNew || !!product;

  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  const needsDetails = !!product && !product.detailsLoaded;

  useEffect(() => {
    if (!editId || !needsDetails) return;
    dispatch(fetchProduct(editId))
      .unwrap()
      .catch((err: unknown) => setFailed({ id: editId, message: typeof err === "string" ? err : "Couldn't load the product." }));
  }, [dispatch, editId, needsDetails]);

  const loadError = failed && failed.id === editId ? failed.message : null;

  return (
    <Drawer
      open={open}
      onClose={close}
      title={product ? "Edit Product" : "Add Product"}
      subtitle={product ? product.name : "Details, pricing, colours and sizes."}
    >
      {open && loadError && (
        <div className="p-6">
          <FormAlert variant="error">{loadError}</FormAlert>
        </div>
      )}
      {open && !loadError && needsDetails && (
        <div className="flex justify-center py-16 text-champagne-600">
          <Spinner size={28} />
        </div>
      )}
      {open && !needsDetails && <ProductForm key={product?.id ?? "new"} product={product} onDone={close} onCancel={close} />}
    </Drawer>
  );
}
