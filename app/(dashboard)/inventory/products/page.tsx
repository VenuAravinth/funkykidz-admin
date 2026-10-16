"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { HiOutlineEye, HiOutlinePencil, HiOutlinePlus } from "react-icons/hi2";
import { LuBarcode } from "react-icons/lu";
import { PageHeader } from "@/components/molecules/PageHeader";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { ProductTagBadges } from "@/components/molecules/ProductTagBadges";
import { ProductThumbnail } from "@/components/molecules/ProductThumbnail";
import { Badge } from "@/components/atoms/Badge";
import { DeleteButton } from "@/components/molecules/DeleteButton";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Select } from "@/components/atoms/Select";
import { Card } from "@/components/atoms/Card";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { ProductFormDrawer, useProductFormLinks } from "@/components/organisms/ProductFormDrawer";
import { ProductBarcodeModal } from "@/components/organisms/ProductBarcodeModal";
import { Pagination } from "@/components/molecules/Pagination";
import { usePagination } from "@/lib/usePagination";
import { useSignedImageUrls } from "@/features/products/useSignedImageUrls";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectCategories, selectProducts, selectProductsError, selectProductsStatus } from "@/stores/slices/catalogSlice";
import { deleteProduct, fetchProducts } from "@/features/products/api";
import { FormAlert } from "@/components/molecules/FormAlert";
import { ProductPublishSwitch } from "@/components/organisms/ProductPublishSwitch";
import type { Product } from "@/types/product";

const linkIconClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-white/70 hover:text-ink";

function variantSummary(product: Product) {
  const colors = new Set(product.variants.map((v) => v.color)).size;
  const sizes = new Set(product.variants.map((v) => v.size)).size;
  return `${colors} ${colors === 1 ? "colour" : "colours"} · ${sizes} ${sizes === 1 ? "size" : "sizes"}`;
}

function StockCell({ product }: { product: Product }) {
  if (!product.inStock) return <Badge tone="danger">Out of stock</Badge>;
  const untracked = product.variants.some((v) => v.stock === null);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-ink">{untracked && product.stock === 0 ? "Not tracked" : product.stock}</span>
      {product.lowStock && <Badge tone="warning">Low</Badge>}
    </span>
  );
}

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const status = useAppSelector(selectProductsStatus);
  const loadError = useAppSelector(selectProductsError);
  const categories = useAppSelector(selectCategories);
  const { newHref, editHref } = useProductFormLinks();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [website, setWebsite] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [barcodeProductId, setBarcodeProductId] = useState<string | null>(null);
  const barcodeProduct = products.find((p) => p.id === barcodeProductId);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const matchesQuery =
      !q || p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.variants.some((v) => v.barcode === q || v.color.toLowerCase().includes(q));
    const matchesCategory = !categoryId || p.categoryId === categoryId;
    const matchesStock =
      !stockFilter || (stockFilter === "out" ? !p.inStock : stockFilter === "low" ? p.inStock && p.lowStock : p.inStock);
    const matchesWebsite = !website || (website === "published") === p.published;
    return matchesQuery && matchesCategory && matchesStock && matchesWebsite;
  });

  const pagination = usePagination(filtered.map((p) => p.id));
  const pageItems = filtered.slice(pagination.start, pagination.end);

  const primaryImages = pageItems.flatMap((p) => (p.images[0] ? [p.images[0]] : []));
  const { signed } = useSignedImageUrls(primaryImages);

  const remove = (product: Product) =>
    dispatch(deleteProduct(product.id))
      .unwrap()
      .catch((err: unknown) => setActionError(typeof err === "string" ? err : "Couldn't delete the product."));

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${filtered.length === products.length ? products.length : `${filtered.length} of ${products.length}`} products`}
        actions={
          <>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Filter by category">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} aria-label="Filter by stock">
              <option value="">All stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </Select>
            <Select value={website} onChange={(e) => setWebsite(e.target.value)} aria-label="Filter by website visibility">
              <option value="">Website: all</option>
              <option value="published">Published</option>
              <option value="hidden">Unpublished</option>
            </Select>
            <SearchInput placeholder="Search name, SKU, colour, barcode…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
            <Link href={newHref} scroll={false}>
              <Button>
                <HiOutlinePlus className="h-5 w-5" />
                Add Product
              </Button>
            </Link>
          </>
        }
      />

      {loadError && (
        <FormAlert variant="error" className="mb-4">
          {loadError}{" "}
          <button type="button" className="underline" onClick={() => dispatch(fetchProducts())}>
            Try again
          </button>
        </FormAlert>
      )}
      {actionError && (
        <FormAlert variant="error" className="mb-4">
          {actionError}{" "}
          <button type="button" className="underline" onClick={() => setActionError(null)}>
            Dismiss
          </button>
        </FormAlert>
      )}

      <div className="flex flex-col gap-3 md:hidden">
        {filtered.length === 0 && (
          <Card className="px-5 py-12 text-center text-sm text-ink-muted">
            {status === "loading" ? "Loading products…" : "No products match your filters."}
          </Card>
        )}
        {pageItems.map((product) => {
          const primary = product.images[0];
          return (
            <Card key={product.id} className="p-4">
              <div className="flex gap-4">
                <ProductThumbnail src={primary ? signed[primary] : undefined} alt={product.name} className="h-20 w-20" />
                <div className="min-w-0 flex-1">
                  <Link href={`/inventory/products/${product.id}`} className="block truncate text-base font-semibold text-ink">
                    {product.name}
                  </Link>
                  <div className="truncate text-sm text-ink-muted">
                    {product.sku && <span className="font-mono">{product.sku} · </span>}
                    {categoryById.get(product.categoryId)?.name ?? product.category ?? "—"} · {variantSummary(product)}
                  </div>
                  <PriceDisplay price={product.price} originalPrice={product.originalPrice} className="mt-1.5" />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StockCell product={product} />
                <ProductTagBadges tag={product.tag} />
                <span className="ml-auto flex items-center gap-2 text-sm text-ink-muted">
                  Website
                  <ProductPublishSwitch product={product} onError={setActionError} />
                </span>
              </div>
              <div className="mt-3 flex items-center justify-end gap-1 border-t border-glass-border pt-2">
                <Link href={`/inventory/products/${product.id}`} aria-label={`View ${product.name}`} className={linkIconClass}>
                  <HiOutlineEye className="h-5 w-5" />
                </Link>
                <Link href={editHref(product.id)} scroll={false} aria-label={`Edit ${product.name}`} className={linkIconClass}>
                  <HiOutlinePencil className="h-5 w-5" />
                </Link>
                <IconButton label={`View barcode for ${product.name}`} title="View barcode" onClick={() => setBarcodeProductId(product.id)}>
                  <LuBarcode className="h-5 w-5" />
                </IconButton>
                <DeleteButton
                  itemLabel={product.name}
                  description={`This will permanently remove ${product.name}, all its colours and sizes, and remove it from the website. This action cannot be undone.`}
                  onDelete={() => remove(product)}
                />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="hidden md:block">
      <Table stickyActions paginate={false}>
        <TableHead>
          <TableRow>
            <Th>Product</Th>
            <Th>Price</Th>
            <Th>Stock</Th>
            <Th>Website</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && (
            <TableEmpty colSpan={5} message={status === "loading" ? "Loading products…" : "No products match your filters."} />
          )}
          {pageItems.map((product) => {
            const primary = product.images[0];
            return (
              <TableRow key={product.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <ProductThumbnail src={primary ? signed[primary] : undefined} alt={product.name} className="h-14 w-14" />
                    <div>
                      <Link href={`/inventory/products/${product.id}`} className="font-medium text-ink hover:text-champagne-700">
                        {product.name}
                      </Link>
                      <div className="max-w-[16rem] truncate text-xs text-ink-muted">
                        {product.sku && <span className="font-mono">{product.sku} · </span>}
                        {categoryById.get(product.categoryId)?.name ?? product.category ?? "—"} · {variantSummary(product)}
                      </div>
                      <div className="mt-1">
                        <ProductTagBadges tag={product.tag} />
                      </div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <PriceDisplay price={product.price} originalPrice={product.originalPrice} className="max-w-[7.5rem]" />
                </Td>
                <Td>
                  <StockCell product={product} />
                </Td>
                <Td>
                  <ProductPublishSwitch product={product} onError={setActionError} />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/inventory/products/${product.id}`} aria-label={`View ${product.name}`} title="View" className={linkIconClass}>
                      <HiOutlineEye className="h-4.5 w-4.5" />
                    </Link>
                    <Link href={editHref(product.id)} scroll={false} aria-label={`Edit ${product.name}`} title="Edit" className={linkIconClass}>
                      <HiOutlinePencil className="h-4.5 w-4.5" />
                    </Link>
                    <IconButton label={`View barcode for ${product.name}`} title="View barcode" onClick={() => setBarcodeProductId(product.id)}>
                      <LuBarcode className="h-4.5 w-4.5" />
                    </IconButton>
                    <DeleteButton
                      itemLabel={product.name}
                      description={`This will permanently remove ${product.name}, all its colours and sizes, and remove it from the website. This action cannot be undone.`}
                      onDelete={() => remove(product)}
                    />
                  </div>
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>

      <Pagination state={pagination} label="products" />

      <ProductBarcodeModal product={barcodeProduct} onClose={() => setBarcodeProductId(null)} />

      <Suspense fallback={null}>
        <ProductFormDrawer />
      </Suspense>
    </div>
  );
}
