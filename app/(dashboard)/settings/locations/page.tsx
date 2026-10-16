import { Card } from "@/components/atoms/Card";
import { LocationsRegistersForm } from "@/components/organisms/settings/LocationsRegistersForm";

export default function LocationsSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-sm font-semibold text-ink">Locations & Registers</h2>
      <p className="mb-6 text-sm text-ink-muted">
        Each register can have its own printer, cashier, opening cash, and payment methods — used across Cash
        Management and Live Sales.
      </p>
      <LocationsRegistersForm />
    </Card>
  );
}
