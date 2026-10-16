import { Card } from "@/components/atoms/Card";
import { PrintSettingsForm } from "@/components/organisms/settings/PrintSettingsForm";

export default function PrintSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Print Settings</h2>
      <p className="mb-6 text-sm text-ink-muted">Particularly important for your physical POS.</p>
      <PrintSettingsForm />
    </Card>
  );
}
