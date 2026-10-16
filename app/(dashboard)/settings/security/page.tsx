import { Card } from "@/components/atoms/Card";
import { SecuritySettingsForm } from "@/components/organisms/settings/SecuritySettingsForm";

export default function SecuritySettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Security Settings</h2>
      <p className="mb-6 text-sm text-ink-muted">Session, login, and manager-PIN protections for sensitive actions.</p>
      <SecuritySettingsForm />
    </Card>
  );
}
