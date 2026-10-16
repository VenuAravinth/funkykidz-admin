"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  HiOutlineShoppingBag,
  HiOutlineGlobeAlt,
  HiOutlineEyeSlash,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { SearchInput } from "@/components/molecules/SearchInput";
import { FormAlert } from "@/components/molecules/FormAlert";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { ProductPublishSwitch } from "@/components/organisms/ProductPublishSwitch";
import { useAppSelector } from "@/stores/hooks";
import { selectProducts } from "@/stores/slices/catalogSlice";

export default function OnlineProductsPage() {
  const products = useAppSelector(selectProducts);
  const [query, setQuery] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q)) &&
        (!website || (website === "published" ? p.published : website === "out" ? !p.inStock : !p.published)),
    );
  }, [products, query, website]);

  const tiles = [
    { label: "Total Products", value: products.length, icon: <HiOutlineShoppingBag className="h-5 w-5" />, tone: "champagne" as const },
    { label: "On Website", value: products.filter((p) => p.published).length, icon: <HiOutlineGlobeAlt className="h-5 w-5" />, tone: "emerald" as const },
    { label: "Unpublished", value: products.filter((p) => !p.published).length, icon: <HiOutlineEyeSlash className="h-5 w-5" />, tone: "sky" as const },
    { label: "Out of Stock", value: products.filter((p) => !p.inStock).length, icon: <HiOutlineXCircle className="h-5 w-5" />, tone: "rose" as const },
    { label: "Low Stock", value: products.filter((p) => p.inStock && p.lowStock).length, icon: <HiOutlineExclamationTriangle className="h-5 w-5" />, tone: "rose" as const },
  ];

  return (
    <div>
      <PageHeader
        title="Online Products"
        subtitle="Turn products on or off for the website. Out-of-stock products are switched off automatically."
        backHref="/online-store"
        backLabel="Online Store"
        actions={
          <>
            <Select value={website} onChange={(e) => setWebsite(e.target.value)} aria-label="Filter by website status">
              <option value="">All products</option>
              <option value="published">Published</option>
              <option value="hidden">Unpublished</option>
              <option value="out">Out of stock</option>
            </Select>
            <SearchInput placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
            <Link href="/inventory/products">
              <Button variant="secondary">Manage products</Button>
            </Link>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
        {tiles.map((tile) => (
          <StatTile key={tile.label} label={tile.label} value={String(tile.value)} icon={tile.icon} tone={tile.tone} />
        ))}
      </div>

      {error && (
        <FormAlert variant="error" className="mb-4">
          {error}
        </FormAlert>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <Th>Product</Th>
            <Th>Price</Th>
            <Th>Stock</Th>
            <Th>Website</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={4} message="No products match your filters." />}
          {rows.map((product) => (
            <TableRow key={product.id}>
              <Td>
                <Link href={`/inventory/products/${product.id}`} className="font-medium text-ink hover:text-champagne-700">
                  {product.name}
                </Link>
                <div className="text-xs text-ink-muted">{product.category}</div>
              </Td>
              <Td>
                <PriceDisplay price={product.price} originalPrice={product.originalPrice} />
              </Td>
              <Td>{product.inStock ? product.stock : <Badge tone="danger">Out of stock</Badge>}</Td>
              <Td>
                <ProductPublishSwitch product={product} onError={setError} />
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
