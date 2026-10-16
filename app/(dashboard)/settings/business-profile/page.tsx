import { Card } from "@/components/atoms/Card";
import { BusinessProfileForm } from "@/components/organisms/settings/BusinessProfileForm";

export default function BusinessProfileSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Business Profile</h2>
      <p className="mb-6 text-sm text-ink-muted">Your Funky Kids business identity.</p>
      <BusinessProfileForm />
    </Card>
  );
}
