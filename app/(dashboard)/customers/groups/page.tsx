"use client";

import { useMemo, useState } from "react";
import { HiOutlinePencil, HiOutlinePlus } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Badge } from "@/components/atoms/Badge";
import { DeleteButton } from "@/components/molecules/DeleteButton";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { formatCurrency } from "@/lib/format";
import { CustomerGroupFormModal } from "@/components/organisms/CustomerGroupFormModal";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { deleteCustomerGroup, selectCustomerGroups, selectCustomers } from "@/stores/slices/customersSlice";
import type { CustomerGroup } from "@/types/customer";

export default function CustomerGroupsPage() {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectCustomerGroups);
  const customers = useAppSelector(selectCustomers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerGroup | undefined>(undefined);

  const customerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const customer of customers) {
      counts.set(customer.groupId, (counts.get(customer.groupId) ?? 0) + 1);
    }
    return counts;
  }, [customers]);

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (group: CustomerGroup) => {
    setEditing(group);
    setModalOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Customer Groups"
        subtitle="Manage pricing, discount, and credit rules applied by customer group."
        backHref="/customers"
        backLabel="Back to Customers"
        actions={
          <Button onClick={openCreate}>
            <HiOutlinePlus className="h-4 w-4" />
            Add Group
          </Button>
        }
      />

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Group</Th>
            <Th>Customers</Th>
            <Th>Discount</Th>
            <Th>Credit</Th>
            <Th>Payment Terms</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.length === 0 && <TableEmpty colSpan={6} message="No customer groups yet." />}
          {groups.map((group) => {
            const count = customerCounts.get(group.id) ?? 0;
            return (
              <TableRow key={group.id}>
                <Td className="font-medium text-ink">{group.name}</Td>
                <Td>{count}</Td>
                <Td>{group.discountPercent}%</Td>
                <Td>
                  {group.creditAllowed ? (
                    <Badge tone="success">{formatCurrency(group.creditLimit)}</Badge>
                  ) : (
                    <Badge tone="neutral">No</Badge>
                  )}
                </Td>
                <Td>{group.paymentTerms}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <IconButton label={`Edit ${group.name}`} onClick={() => openEdit(group)}>
                      <HiOutlinePencil className="h-4 w-4" />
                    </IconButton>
                    <DeleteButton
                      itemLabel={group.name}
                      disabled={count > 0}
                      disabledReason={`Cannot delete — ${count} customer(s) belong to this group.`}
                      description={`This will permanently remove ${group.name}. This action cannot be undone.`}
                      onDelete={() => dispatch(deleteCustomerGroup(group.id))}
                    />
                  </div>
                </Td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <CustomerGroupFormModal open={modalOpen} group={editing} onClose={() => setModalOpen(false)} />
    </div>
  );
}
