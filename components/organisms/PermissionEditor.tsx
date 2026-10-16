"use client";

import { useState } from "react";
import { HiOutlineCheck } from "react-icons/hi2";
import { Card } from "@/components/atoms/Card";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Button } from "@/components/atoms/Button";
import { PERMISSION_CATALOG } from "@/lib/dummy-data/roles";
import { useAppDispatch } from "@/stores/hooks";
import { updateRolePermissions } from "@/stores/slices/rolesSlice";
import { addActivityLog } from "@/stores/slices/activityLogsSlice";
import type { Role } from "@/types/role";

export function PermissionEditor({ role }: { role: Role }) {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<Set<string>>(new Set(role.permissionKeys));
  const [saved, setSaved] = useState(true);

  const toggleKey = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setSaved(false);
  };

  const toggleGroup = (groupKeys: string[], allSelected: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const key of groupKeys) {
        if (allSelected) next.delete(key);
        else next.add(key);
      }
      return next;
    });
    setSaved(false);
  };

  const totalItems = PERMISSION_CATALOG.reduce((sum, g) => sum + g.items.length, 0);

  const onSave = () => {
    dispatch(updateRolePermissions({ id: role.id, permissionKeys: Array.from(selected) }));
    dispatch(
      addActivityLog({ userId: "usr_admin", userName: "Admin", action: "Permission Changed", module: "Security", reference: role.name }),
    );
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {selected.size} of {totalItems} permissions granted
        </p>
        <Button size="sm" onClick={onSave} disabled={saved}>
          <HiOutlineCheck className="h-4 w-4" />
          {saved ? "Saved" : "Save Permissions"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {PERMISSION_CATALOG.map((group) => {
          const groupKeys = group.items.map((item) => item.key);
          const allSelected = groupKeys.every((key) => selected.has(key));
          const someSelected = groupKeys.some((key) => selected.has(key));

          return (
            <Card key={group.key} className="p-5">
              <div className="mb-3 flex items-center justify-between border-b border-glass-border pb-3">
                <h3 className="text-sm font-semibold text-ink">{group.label}</h3>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-muted">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={() => toggleGroup(groupKeys, allSelected)}
                  />
                  Select all
                </label>
              </div>
              <div className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <label key={item.key} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                    <Checkbox checked={selected.has(item.key)} onChange={() => toggleKey(item.key)} />
                    {item.label}
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
