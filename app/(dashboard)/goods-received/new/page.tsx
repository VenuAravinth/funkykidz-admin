import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card } from "@/components/atoms/Card";
import { POSelectRedirect } from "@/components/organisms/POSelectRedirect";
import { ReceiveStockForm } from "@/components/organisms/ReceiveStockForm";
import { FormField } from "@/components/molecules/FormField";
import { getPurchaseOrderById, purchaseOrders } from "@/lib/dummy-data/suppliers";

export const metadata: Metadata = {
  title: "Receive Stock — Supplier Management",
};

export default async function ReceiveStockPage({ searchParams }: { searchParams: Promise<{ poId?: string }> }) {
  const { poId } = await searchParams;
  const receivablePOs = purchaseOrders.filter((po) => po.status === "pending" || po.status === "partial");
  const selectedPO = poId ? getPurchaseOrderById(poId) : undefined;

  return (
    <div>
      <PageHeader
        title="Receive Stock"
        subtitle="Log inbound goods against an open purchase order."
        backHref="/goods-received"
        backLabel="Back to Goods Received"
      />
      <Card className="max-w-5xl p-6">
        <div className="mb-6 max-w-md">
          <FormField id="poSelect" label="Purchase order">
            <POSelectRedirect orders={receivablePOs} selectedId={poId} />
          </FormField>
        </div>

        {selectedPO ? (
          <ReceiveStockForm key={selectedPO.id} po={selectedPO} />
        ) : (
          <p className="rounded-xl border border-dashed border-glass-border bg-white/30 p-8 text-center text-sm text-ink-muted">
            Select a purchase order above to log its receipt.
          </p>
        )}
      </Card>
    </div>
  );
}
