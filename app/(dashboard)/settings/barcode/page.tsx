import { Card } from "@/components/atoms/Card";
import { BarcodeGlobalSettingsForm } from "@/components/organisms/settings/BarcodeGlobalSettingsForm";

export default function BarcodeSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Barcode Settings</h2>
      <p className="mb-6 text-sm text-ink-muted">Controls product barcode behavior across the ERP.</p>
      <BarcodeGlobalSettingsForm />
    </Card>
  );
}
