"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { HiOutlineArrowDownTray, HiOutlinePencilSquare, HiOutlinePrinter } from "react-icons/hi2";
import { IconButton } from "@/components/atoms/IconButton";
import { LuBarcode } from "react-icons/lu";
import { ProductBarcodeModal } from "@/components/organisms/ProductBarcodeModal";
import { downloadBarcodeLabels } from "@/lib/barcodeImage";
import { sellableUnits } from "@/lib/barcode";
import { useBarcodePrinter } from "@/components/organisms/BarcodePrintSheet";
import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/components/atoms/Table";
import { PageHeader } from "@/components/molecules/PageHeader";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { ProductTagBadges } from "@/components/molecules/ProductTagBadges";
import { ProductThumbnail } from "@/components/molecules/ProductThumbnail";
import { DeleteButton } from "@/components/molecules/DeleteButton";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { ProductFormDrawer, useProductFormLinks } from "@/components/organisms/ProductFormDrawer";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useSignedImageUrls } from "@/features/products/useSignedImageUrls";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectCategoryById, selectProductById, selectProductsStatus } from "@/stores/slices/catalogSlice";
import { deleteProduct, fetchProduct } from "@/features/products/api";
import { ProductPublishSwitch } from "@/components/organisms/ProductPublishSwitch";
import { variantLabel } from "@/types/product";

function Detail({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) => selectProductById(state, id));
  const category = useAppSelector((state) => (product ? selectCategoryById(state, product.categoryId) : undefined));
  const status = useAppSelector(selectProductsStatus);
  const images = product?.images ?? [];
  const { signed, error: imageError } = useSignedImageUrls(images);
  const [activeImage, setActiveImage] = useState(0);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { print: printBarcodes, sheet: printSheet } = useBarcodePrinter();
  const { editHref } = useProductFormLinks();
  const needsDetails = !!product && !product.detailsLoaded;

  useEffect(() => {
    if (needsDetails) dispatch(fetchProduct(id));
  }, [dispatch, id, needsDetails]);

  if (!product && (status === "idle" || status === "loading")) {
    return <PageHeader title="Loading product…" backHref="/inventory/products" backLabel="Back to Products" />;
  }

  if (!product) {
    return (
      <div>
        <PageHeader title="Product not found" backHref="/inventory/products" backLabel="Back to Products" />
        <p className="text-sm text-ink-muted">
          This product may have been deleted.{" "}
          <Link href="/inventory/products" className="font-medium text-champagne-600 hover:text-champagne-700">
            Return to the product list.
          </Link>
        </p>
      </div>
    );
  }

  const units = sellableUnits(product);
  const colors = [...new Set(product.variants.map((v) => v.color))];
  const swatch = new Map(product.colors.map((c) => [c.name, c.hex]));
  const mainImage = images[Math.min(activeImage, images.length - 1)];

  return (
    <div>
      <PageHeader
        title={product.name}
        subtitle={[category?.name ?? product.category, product.gender].filter(Boolean).join(" · ")}
        backHref="/inventory/products"
        backLabel="Back to Products"
        actions={
          <>
            <Link href={editHref(product.id)} scroll={false}>
              <Button>
                <HiOutlinePencilSquare className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeleteButton
              itemLabel={product.name}
              description={`This will permanently remove ${product.name}, all its colours and sizes, and remove it from the website. This action cannot be undone.`}
              onDelete={() =>
                dispatch(deleteProduct(product.id))
                  .unwrap()
                  .then(() => router.push("/inventory/products"))
                  .catch((err: unknown) => setActionError(typeof err === "string" ? err : "Couldn't delete the product."))
              }
            />
          </>
        }
      />

      {actionError && (
        <FormAlert variant="error" className="mb-4">
          {actionError}
        </FormAlert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card className="p-4">
          <ProductThumbnail src={mainImage ? signed[mainImage] : undefined} alt={product.name} className="aspect-square w-full" />
          {images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  className={cn("rounded-xl ring-2 ring-transparent transition", index === activeImage && "ring-champagne-500")}
                >
                  <ProductThumbnail src={signed[url]} alt="" className="h-16 w-16" />
                </button>
              ))}
            </div>
          )}
          {images.length === 0 && <p className="mt-3 text-center text-sm text-ink-muted">No images uploaded yet.</p>}
          {imageError && (
            <FormAlert variant="error" className="mt-3">
              {imageError}
            </FormAlert>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {!product.inStock ? (
                  <Badge tone="danger">Out of stock</Badge>
                ) : (
                  product.lowStock && <Badge tone="warning">Low stock</Badge>
                )}
                <ProductTagBadges tag={product.tag} />
              </div>
              <label className="flex items-center gap-3 text-sm text-ink-muted">
                Published on website
                <ProductPublishSwitch product={product} onError={setActionError} />
              </label>
            </div>
            <PriceDisplay price={product.price} originalPrice={product.originalPrice} size="lg" className="mt-4" />
            {product.description && <p className="mt-4 text-sm text-ink-muted">{product.description}</p>}
          </Card>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">Colours, sizes &amp; barcodes</h2>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => setBarcodeOpen(true)}>
                  <LuBarcode className="h-4.5 w-4.5" />
                  View all
                </Button>
                <Button size="sm" variant="secondary" onClick={() => downloadBarcodeLabels(units, product.slug)}>
                  <HiOutlineArrowDownTray className="h-4.5 w-4.5" />
                  Download all
                </Button>
                <Button size="sm" variant="secondary" onClick={() => printBarcodes(units)}>
                  <HiOutlinePrinter className="h-4.5 w-4.5" />
                  Print all
                </Button>
              </div>
            </div>
            <Table stickyActions paginate={false}>
              <TableHead>
                <TableRow>
                  <Th>Colour</Th>
                  <Th>Size</Th>
                  <Th>Stock</Th>
                  <Th>Barcode</Th>
                  <Th className="text-right">Actions</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {colors.flatMap((color) =>
                  product.variants
                    .filter((v) => v.color === color)
                    .map((v, i) => {
                      const unit = units.find((u) => u.key === v.id)!;
                      return (
                        <TableRow key={v.id}>
                          <Td className="font-medium">
                            {i === 0 && (
                              <span className="inline-flex items-center gap-2">
                                <span className="h-3.5 w-3.5 rounded-full border border-ink/10" style={{ background: swatch.get(color) }} aria-hidden />
                                {color}
                              </span>
                            )}
                          </Td>
                          <Td>{v.size}</Td>
                          <Td>
                            {v.stock === null ? (
                              <span className="text-ink-muted">Not tracked</span>
                            ) : v.stock === 0 ? (
                              <Badge tone="danger">0</Badge>
                            ) : (
                              v.stock
                            )}
                          </Td>
                          <Td className="font-mono text-xs">{v.barcode}</Td>
                          <Td className="text-right">
                            <div className="flex justify-end gap-1">
                              <IconButton
                                label={`Download barcode for ${variantLabel(v)}`}
                                title="Download barcode"
                                onClick={() => downloadBarcodeLabels([unit], product.slug)}
                              >
                                <HiOutlineArrowDownTray className="h-4.5 w-4.5" />
                              </IconButton>
                              <IconButton label={`Print barcode for ${variantLabel(v)}`} title="Print barcode" onClick={() => printBarcodes([unit])}>
                                <HiOutlinePrinter className="h-4.5 w-4.5" />
                              </IconButton>
                            </div>
                          </Td>
                        </TableRow>
                      );
                    }),
                )}
              </TableBody>
            </Table>
          </div>

          <Card className="p-6">
            <dl className="grid grid-cols-2 gap-x-5 gap-y-6 xl:grid-cols-3">
              <Detail label="SKU code" value={product.sku && <span className="font-mono">{product.sku}</span>} />
              <Detail label="Category" value={category?.name ?? product.category} />
              <Detail label="Subcategory" value={product.subcategory} />
              <Detail label="Gender" value={product.gender} />
              <Detail label="Brand" value={product.brand} />
              <Detail label="MRP" value={formatCurrency(product.originalPrice ?? product.price)} />
              <Detail label="Selling price" value={formatCurrency(product.price)} />
              <Detail label="Cost price" value={formatCurrency(product.costPrice)} />
              <Detail label="Total stock" value={String(product.stock)} />
              <Detail label="Low-stock alert at" value={String(product.reorderLevel)} />
              <Detail label="Fabric" value={product.fabric} />
              <Detail label="Fit" value={product.fit} />
              <Detail label="Care" value={product.care} />
              <Detail label="Created" value={product.createdDate ? formatDate(product.createdDate) : undefined} />
            </dl>
          </Card>
        </div>
      </div>

      <ProductBarcodeModal product={barcodeOpen ? product : undefined} onClose={() => setBarcodeOpen(false)} />
      {printSheet}

      <Suspense fallback={null}>
        <ProductFormDrawer />
      </Suspense>
    </div>
  );
}
