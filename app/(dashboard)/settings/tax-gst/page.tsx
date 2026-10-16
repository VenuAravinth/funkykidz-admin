import { Card } from "@/components/atoms/Card";
import { TaxSettingsForm } from "@/components/organisms/settings/TaxSettingsForm";

export default function TaxSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Tax / GST</h2>
      <p className="mb-6 text-sm text-ink-muted">
        This affects financial documents — changes here should be permission-controlled.
      </p>
      <TaxSettingsForm />
    </Card>
  );
}
