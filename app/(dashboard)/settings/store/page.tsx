import { Card } from "@/components/atoms/Card";
import { StoreSettingsForm } from "@/components/organisms/settings/StoreSettingsForm";

export default function StoreSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Store Settings</h2>
      <p className="mb-6 text-sm text-ink-muted">Controls how your physical store operates.</p>
      <StoreSettingsForm />
    </Card>
  );
}
