"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineNoSymbol, HiOutlineCheckCircle } from "react-icons/hi2";
import { Button } from "@/components/atoms/Button";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import type { SupplierStatus } from "@/types/supplier";

export function DeactivateSupplierButton({ supplierName, status }: { supplierName: string; status: SupplierStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isActive = status === "active";

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {isActive ? (
          <>
            <HiOutlineNoSymbol className="h-4 w-4" />
            Deactivate
          </>
        ) : (
          <>
            <HiOutlineCheckCircle className="h-4 w-4" />
            Reactivate
          </>
        )}
      </Button>
      <ConfirmDialog
        open={open}
        title={isActive ? "Deactivate supplier?" : "Reactivate supplier?"}
        description={
          isActive
            ? `${supplierName} will be marked inactive and hidden from new purchase order creation. This is a demo action and won't persist after refresh.`
            : `${supplierName} will be marked active again. This is a demo action and won't persist after refresh.`
        }
        confirmLabel={isActive ? "Deactivate" : "Reactivate"}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
