import { Card } from "@/components/atoms/Card";
import { NotificationSettingsForm } from "@/components/organisms/settings/NotificationSettingsForm";

export default function NotificationSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Notification Settings</h2>
      <p className="mb-6 text-sm text-ink-muted">Controls which notifications users receive, and how.</p>
      <NotificationSettingsForm />
    </Card>
  );
}
