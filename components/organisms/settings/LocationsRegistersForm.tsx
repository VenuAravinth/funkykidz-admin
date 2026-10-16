"use client";

import { useState } from "react";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Badge } from "@/components/atoms/Badge";
import { FormField } from "@/components/molecules/FormField";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { addLocation, addRegister, removeLocation, removeRegister, selectLocations } from "@/stores/slices/settingsSlice";

function AddRegisterRow({ locationId }: { locationId: string }) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  function submit() {
    if (!name.trim() || !code.trim()) return;
    dispatch(addRegister({ locationId, name: name.trim(), code: code.trim() }));
    setName("");
    setCode("");
  }

  return (
    <div className="flex items-end gap-3">
      <FormField id={`${locationId}-register-name`} label="Register name">
        <Input id={`${locationId}-register-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Counter 3" />
      </FormField>
      <FormField id={`${locationId}-register-code`} label="Code">
        <Input id={`${locationId}-register-code`} className="w-24" value={code} onChange={(e) => setCode(e.target.value)} placeholder="C3" />
      </FormField>
      <Button type="button" variant="secondary" size="sm" onClick={submit} disabled={!name.trim() || !code.trim()}>
        <HiOutlinePlus className="h-4 w-4" />
        Add Register
      </Button>
    </div>
  );
}

export function LocationsRegistersForm() {
  const dispatch = useAppDispatch();
  const locations = useAppSelector(selectLocations);
  const [newLocationName, setNewLocationName] = useState("");

  return (
    <div className="flex flex-col gap-6">
      {locations.map((location) => (
        <Card key={location.id} className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">{location.name}</h3>
            <IconButton label={`Remove ${location.name}`} onClick={() => dispatch(removeLocation(location.id))}>
              <HiOutlineTrash className="h-4 w-4" />
            </IconButton>
          </div>

          {location.registers.length > 0 && (
            <div className="mb-4 flex flex-col gap-2">
              {location.registers.map((register) => (
                <div key={register.id} className="flex items-center gap-3 rounded-xl border border-glass-border bg-white/40 px-4 py-2.5">
                  <span className="text-sm font-medium text-ink">{register.name}</span>
                  <Badge tone="info">{register.code}</Badge>
                  <span className="text-xs text-ink-muted">Opening cash ₹{register.openingCash}</span>
                  <IconButton
                    label={`Remove ${register.name}`}
                    className="ml-auto"
                    onClick={() => dispatch(removeRegister({ locationId: location.id, registerId: register.id }))}
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}

          <AddRegisterRow locationId={location.id} />
        </Card>
      ))}

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-ink">Add location</h3>
        <div className="flex items-end gap-3">
          <FormField id="newLocationName" label="Location name" className="max-w-xs">
            <Input id="newLocationName" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} placeholder="e.g. Branch 2" />
          </FormField>
          <Button
            type="button"
            disabled={!newLocationName.trim()}
            onClick={() => {
              dispatch(addLocation(newLocationName.trim()));
              setNewLocationName("");
            }}
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add Location
          </Button>
        </div>
      </Card>
    </div>
  );
}
