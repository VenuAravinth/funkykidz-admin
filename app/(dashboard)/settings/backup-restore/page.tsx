import { Card } from "@/components/atoms/Card";
import { BackupRestoreForm } from "@/components/organisms/settings/BackupRestoreForm";

export default function BackupRestoreSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Backup / Restore</h2>
      <p className="mb-6 text-sm text-ink-muted">Protects the entire ERP database.</p>
      <BackupRestoreForm />
    </Card>
  );
}
