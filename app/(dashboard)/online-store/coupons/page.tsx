"use client";

import { useState } from "react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTicket, HiOutlineUsers, HiOutlineBanknotes } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { CouponFormModal } from "@/components/organisms/CouponFormModal";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAppSelector } from "@/stores/hooks";
import { selectCoupons } from "@/stores/slices/onlineStoreSlice";
import type { Coupon } from "@/types/onlineStore";

export default function CouponsPage() {
  const coupons = useAppSelector(selectCoupons);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | undefined>(undefined);

  const activeCoupons = coupons.filter((c) => c.status === "active").length;
  const usedThisMonth = coupons.reduce((sum, c) => sum + c.usedCount, 0);
  const discountGiven = coupons.reduce((sum, c) => {
    const perUse = c.discountType === "Percentage" ? Math.min(c.maximumDiscount ?? Infinity, 300) : c.discountValue;
    return sum + perUse * c.usedCount;
  }, 0);

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setModalOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle="Create and manage online discount codes."
        backHref="/online-store"
        backLabel="Online Store"
        actions={
          <Button onClick={openCreate}>
            <HiOutlinePlus className="h-4 w-4" />
            Create Coupon
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile label="Active Coupons" value={String(activeCoupons)} icon={<HiOutlineTicket className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Used This Month" value={String(usedThisMonth)} icon={<HiOutlineUsers className="h-5 w-5" />} tone="sky" />
        <StatTile label="Discount Given" value={formatCurrency(discountGiven)} icon={<HiOutlineBanknotes className="h-5 w-5" />} tone="emerald" />
      </div>

      <div className="my-5" />

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Code</Th>
            <Th>Discount</Th>
            <Th>Minimum Order</Th>
            <Th>Usage</Th>
            <Th>Valid</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {coupons.length === 0 && <TableEmpty colSpan={7} message="No coupons yet." />}
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <Td>
                <div className="font-medium text-ink">{coupon.code}</div>
                <div className="text-xs text-ink-muted">{coupon.onlineOnly ? "Online only" : "Online + POS"}</div>
              </Td>
              <Td>{coupon.discountType === "Percentage" ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}</Td>
              <Td>{coupon.minimumOrder ? formatCurrency(coupon.minimumOrder) : "—"}</Td>
              <Td>
                {coupon.usedCount}
                {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
              </Td>
              <Td className="whitespace-nowrap text-ink-muted">
                {formatDate(coupon.startDate)} – {formatDate(coupon.endDate)}
              </Td>
              <Td>
                <StatusBadge status={coupon.status} />
              </Td>
              <Td className="text-right">
                <IconButton label={`Edit ${coupon.code}`} onClick={() => openEdit(coupon)}>
                  <HiOutlinePencil className="h-4 w-4" />
                </IconButton>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CouponFormModal open={modalOpen} coupon={editing} onClose={() => setModalOpen(false)} />
    </div>
  );
}
