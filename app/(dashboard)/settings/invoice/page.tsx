import { Card } from "@/components/atoms/Card";
import { InvoiceSettingsForm } from "@/components/organisms/settings/InvoiceSettingsForm";

export default function InvoiceSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Invoice Settings</h2>
      <p className="mb-6 text-sm text-ink-muted">Controls how invoices are generated.</p>
      <InvoiceSettingsForm />
    </Card>
  );
}
