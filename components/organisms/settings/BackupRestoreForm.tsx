"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { backupDestinations, backupFrequencies, type BackupSettings } from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectBackupSettings, updateBackupSettings, runManualBackup } from "@/stores/slices/settingsSlice";

export function BackupRestoreForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectBackupSettings);
  const [saved, setSaved] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<string>(settings.history[1]?.id ?? "");
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);

  const { register, handleSubmit } = useForm<Omit<BackupSettings, "history" | "lastBackupAt" | "lastBackupStatus" | "databaseSizeMb">>({
    defaultValues: {
      autoBackupEnabled: settings.autoBackupEnabled,
      frequency: settings.frequency,
      time: settings.time,
      keepBackupsDays: settings.keepBackupsDays,
      destination: settings.destination,
    },
  });

  const onSubmit = handleSubmit((values) => {
    dispatch(updateBackupSettings(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  function handleManualBackup() {
    setBackingUp(true);
    setTimeout(() => {
      dispatch(runManualBackup());
      setBackingUp(false);
    }, 800);
  }

  const restoreEntry = settings.history.find((entry) => entry.id === restoreTarget);

  return (
    <div className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Backup settings updated.</FormAlert>}

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Backup dashboard</h3>
        <Card className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-ink-muted">Last Backup</p>
            <p className="mt-1 text-sm font-medium text-ink">{new Date(settings.lastBackupAt).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Status</p>
            <Badge tone={settings.lastBackupStatus === "Successful" ? "success" : "danger"} className="mt-1">
              {settings.lastBackupStatus}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Database Size</p>
            <p className="mt-1 text-sm font-medium text-ink">{settings.databaseSizeMb} MB</p>
          </div>
        </Card>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Manual backup</h3>
        <Button type="button" onClick={handleManualBackup} isLoading={backingUp}>
          Backup Now
        </Button>
      </section>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Automatic backup</h3>
          <div className="mb-4">
            <CheckboxField id="autoBackupEnabled" label="Automatic backup" {...register("autoBackupEnabled")} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormField id="frequency" label="Frequency">
              <Select id="frequency" {...register("frequency")}>
                {backupFrequencies.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField id="time" label="Time">
              <Input id="time" type="time" {...register("time")} />
            </FormField>
            <FormField id="keepBackupsDays" label="Keep backups (days)">
              <Input id="keepBackupsDays" type="number" min={1} {...register("keepBackupsDays", { valueAsNumber: true })} />
            </FormField>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Backup destination</h3>
          <FormField id="destination" label="Destination" className="max-w-xs">
            <Select id="destination" {...register("destination")}>
              {backupDestinations.map((dest) => (
                <option key={dest} value={dest}>
                  {dest}
                </option>
              ))}
            </Select>
          </FormField>
        </section>

        <div>
          <Button type="submit">Save Backup Settings</Button>
        </div>
      </form>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Backup history</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-glass-border text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <th className="py-2 pr-4">Date</th>
                <th className="px-2 py-2">Size</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {settings.history.map((entry) => (
                <tr key={entry.id} className="border-b border-glass-border/60">
                  <td className="py-3 pr-4 text-ink">{new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                  <td className="px-2 py-3 text-ink-muted">{entry.sizeMb} MB</td>
                  <td className="px-2 py-3 text-ink-muted">{entry.type}</td>
                  <td className="px-2 py-3">
                    <Badge tone={entry.status === "Successful" ? "success" : "danger"}>{entry.status}</Badge>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <Button type="button" variant="ghost" size="sm">
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Restore</h3>
        <Card className="p-5">
          <FormAlert variant="error">Restoring will replace current data. This requires administrator confirmation.</FormAlert>
          <div className="mt-4 max-w-xs">
            <FormField id="restoreTarget" label="Backup">
              <Select id="restoreTarget" value={restoreTarget} onChange={(e) => setRestoreTarget(e.target.value)}>
                {settings.history.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {new Date(entry.date).toLocaleString("en-IN")}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <div className="mt-4">
            <Button type="button" variant="secondary" disabled={!restoreTarget} onClick={() => setConfirmRestoreOpen(true)}>
              Restore
            </Button>
          </div>
        </Card>
      </section>

      <ConfirmDialog
        open={confirmRestoreOpen}
        title="Restore database?"
        description={`This will replace current data with the backup from ${restoreEntry ? new Date(restoreEntry.date).toLocaleString("en-IN") : "the selected date"}. This action cannot be undone.`}
        confirmLabel="Restore"
        onCancel={() => setConfirmRestoreOpen(false)}
        onConfirm={() => setConfirmRestoreOpen(false)}
      />
    </div>
  );
}
