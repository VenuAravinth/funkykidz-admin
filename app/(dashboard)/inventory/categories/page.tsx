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
import { CategoryFormModal } from "@/components/organisms/CategoryFormModal";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectCategories, selectCategoriesError, selectCategoriesStatus } from "@/stores/slices/catalogSlice";
import { deleteCategory, fetchCategories, updateCategory } from "@/features/categories/api";
import type { Category } from "@/types/product";

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const status = useAppSelector(selectCategoriesStatus);
  const loadError = useAppSelector(selectCategoriesError);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleDelete = async (item: Category) => {
    setActionError(null);
    try {
      await dispatch(deleteCategory(item.id)).unwrap();
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Couldn't delete the category. Please try again.");
    }
  };

  const toggleStatus = async (item: Category, active: boolean) => {
    setActionError(null);
    try {
      await dispatch(
        updateCategory({ id: item.id, input: { name: item.name, description: item.description, status: active ? "active" : "inactive" } }),
      ).unwrap();
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Couldn't change the status. Please try again.");
    }
  };

  const filtered = categories.filter(
    (c) => !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.slug.includes(query.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setModalOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories on record`}
        actions={
          <>
            <SearchInput
              placeholder="Search categories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={openCreate}>
              <HiOutlinePlus className="h-4 w-4" />
              Add Category
            </Button>
          </>
        }
      />

      {(actionError || loadError) && (
        <FormAlert variant="error" className="mb-4">
          {actionError ?? loadError}{" "}
          {loadError && !actionError && (
            <button type="button" className="underline" onClick={() => dispatch(fetchCategories())}>
              Retry
            </button>
          )}
        </FormAlert>
      )}

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Category</Th>
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
                  ? "Loading categories…"
                  : query
                    ? "No categories match your search."
                    : "No categories yet. Add one to get started."
              }
            />
          )}
          {filtered.map((category) => {
            const count = category.productCount ?? 0;
            return (
              <TableRow key={category.id}>
                <Td>
                  <div className="font-medium text-ink">{category.name}</div>
                  <div className="text-xs text-ink-muted">{category.slug}</div>
                </Td>
                <Td className="max-w-xs whitespace-normal text-ink-muted">{category.description || "—"}</Td>
                <Td>{count}</Td>
                <Td>
                  <StatusSwitch
                    active={category.status === "active"}
                    name={category.name}
                    onChange={(active) => toggleStatus(category, active)}
                  />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <IconButton label={`Edit ${category.name}`} onClick={() => openEdit(category)}>
                      <HiOutlinePencil className="h-4 w-4" />
                    </IconButton>
                    <DeleteButton
                      itemLabel={category.name}
                      disabled={count > 0}
                      disabledReason={`Cannot delete — ${count} product(s) use this category.`}
                      description={`This will permanently remove ${category.name}. This action cannot be undone.`}
                      onDelete={() => handleDelete(category)}
                    />
                  </div>
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <CategoryFormModal open={modalOpen} category={editing} onClose={() => setModalOpen(false)} />
    </div>
  );
}
