import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { StorefrontContentForm } from "@/components/organisms/StorefrontContentForm";

export default function StorefrontContentPage() {
  return (
    <div>
      <PageHeader
        title="Storefront Content"
        subtitle="Homepage banners, hero images, and the announcement bar shown to shoppers."
        backHref="/online-store"
        backLabel="Online Store"
      />
      <Card className="p-6">
        <StorefrontContentForm />
      </Card>
    </div>
  );
}
