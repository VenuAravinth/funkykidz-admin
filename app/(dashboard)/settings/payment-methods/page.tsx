import { Card } from "@/components/atoms/Card";
import { PaymentMethodsForm } from "@/components/organisms/settings/PaymentMethodsForm";

export default function PaymentMethodsSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Payment Methods</h2>
      <p className="mb-6 text-sm text-ink-muted">Control how customers can pay.</p>
      <PaymentMethodsForm />
    </Card>
  );
}
