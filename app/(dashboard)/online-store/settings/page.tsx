import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { OnlineStoreSettingsForm } from "@/components/organisms/settings/OnlineStoreSettingsForm";

export default function OnlineStoreSettingsPage() {
  return (
    <div>
      <PageHeader title="Store Settings" subtitle="Controls how your online storefront behaves." backHref="/online-store" backLabel="Online Store" />
      <Card className="p-6">
        <OnlineStoreSettingsForm />
      </Card>
    </div>
  );
}
