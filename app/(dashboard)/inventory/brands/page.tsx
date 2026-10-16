"use client";

import { useEffect, useState } from "react";
import { HiOutlinePencil, HiOutlinePlus } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { StatusSwitch } from "@/components/molecules/StatusSwitch";
import { DeleteButton } from "@/components/molecules/DeleteButton";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { BrandFormModal } from "@/components/organisms/BrandFormModal";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectBrands, selectBrandsError, selectBrandsStatus } from "@/stores/slices/catalogSlice";
import { deleteBrand, fetchBrands, updateBrand } from "@/features/brands/api";
import type { Brand } from "@/types/product";

export default function BrandsPage() {
  const dispatch = useAppDispatch();
  const brands = useAppSelector(selectBrands);
  const status = useAppSelector(selectBrandsStatus);
  const loadError = useAppSelector(selectBrandsError);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | undefined>(undefined);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const handleDelete = async (item: Brand) => {
    setActionError(null);
    try {
      await dispatch(deleteBrand(item.id)).unwrap();
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Couldn't delete the brand. Please try again.");
    }
  };

  const toggleStatus = async (item: Brand, active: boolean) => {
    setActionError(null);
    try {
      await dispatch(
        updateBrand({ id: item.id, input: { name: item.name, description: item.description, status: active ? "active" : "inactive" } }),
      ).unwrap();
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Couldn't change the status. Please try again.");
    }
  };

  const filtered = brands.filter(
    (b) => !query || b.name.toLowerCase().includes(query.toLowerCase()) || b.slug.includes(query.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setModalOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Brands"
        subtitle={`${brands.length} brands on record`}
        actions={
          <>
            <SearchInput
              placeholder="Search brands…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={openCreate}>
              <HiOutlinePlus className="h-4 w-4" />
              Add Brand
            </Button>
          </>
        }
      />

      {(actionError || loadError) && (
        <FormAlert variant="error" className="mb-4">
          {actionError ?? loadError}{" "}
          {loadError && !actionError && (
            <button type="button" className="underline" onClick={() => dispatch(fetchBrands())}>
              Retry
            </button>
          )}
        </FormAlert>
      )}

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Brand</Th>
            <Th>Description</Th>
            <Th>Products</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 && (
            <TableEmpty
              colSpan={5}
              message={
                status === "loading" || status === "idle"
                  ? "Loading brands…"
                  : query
                    ? "No brands match your search."
                    : "No brands yet. Add one to get started."
              }
            />
          )}
          {filtered.map((brand) => {
            const count = brand.productCount ?? 0;
            return (
              <TableRow key={brand.id}>
                <Td>
                  <div className="font-medium text-ink">{brand.name}</div>
                  <div className="text-xs text-ink-muted">{brand.slug}</div>
                </Td>
                <Td className="max-w-xs whitespace-normal text-ink-muted">{brand.description || "—"}</Td>
                <Td>{count}</Td>
                <Td>
                  <StatusSwitch
                    active={brand.status === "active"}
                    name={brand.name}
                    onChange={(active) => toggleStatus(brand, active)}
                  />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <IconButton label={`Edit ${brand.name}`} onClick={() => openEdit(brand)}>
                      <HiOutlinePencil className="h-4 w-4" />
                    </IconButton>
                    <DeleteButton
                      itemLabel={brand.name}
                      disabled={count > 0}
                      disabledReason={`Cannot delete — ${count} product(s) use this brand.`}
                      description={`This will permanently remove ${brand.name}. This action cannot be undone.`}
                      onDelete={() => handleDelete(brand)}
                    />
                  </div>
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <BrandFormModal open={modalOpen} brand={editing} onClose={() => setModalOpen(false)} />
    </div>
  );
}
