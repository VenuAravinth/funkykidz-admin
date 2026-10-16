import { Barcode } from "@/components/atoms/Barcode";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import { LABEL_DIMENSIONS_MM, type BarcodeSettings } from "@/types/barcode";

export interface LabelData {
  productName: string;
  size?: string;
  color?: string;
  price: number;
  barcode: string;
}

const FONT_MM = { store: 2.1, product: 2.5, variant: 1.9, price: 2.5 };
const GAP_MM = 0.5;
const PADDING_MM = 1.2;
const BARCODE_HEIGHT_MM = 6;

export function LabelPreview({
  data,
  settings,
  scale = 3,
  className,
}: {
  data: LabelData;
  settings: BarcodeSettings;
  scale?: number;
  className?: string;
}) {
  const { width, height } = LABEL_DIMENSIONS_MM[settings.labelSize];
  const variantLine = [data.size, data.color].filter(Boolean).join(" · ");

  return (
    <div
      style={{
        width: `${width * scale}mm`,
        height: `${height * scale}mm`,
        padding: `${PADDING_MM * scale}mm`,
        gap: `${GAP_MM * scale}mm`,
      }}
      className={cn(
        "flex flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-ink/30 bg-white text-center",
        className,
      )}
    >
      {settings.showStoreName && (
        <p style={{ fontSize: `${FONT_MM.store * scale}mm` }} className="font-bold uppercase leading-none tracking-widest text-ink">
          Funky Kids
        </p>
      )}
      <p style={{ fontSize: `${FONT_MM.product * scale}mm` }} className="line-clamp-1 w-full leading-none font-semibold text-ink">
        {data.productName}
      </p>
      {variantLine && (
        <p style={{ fontSize: `${FONT_MM.variant * scale}mm` }} className="leading-none text-ink-muted">
          {variantLine}
        </p>
      )}
      {settings.showPrice && (
        <p style={{ fontSize: `${FONT_MM.price * scale}mm` }} className="leading-none font-bold text-ink">
          {formatCurrency(data.price)}
        </p>
      )}
      <div style={{ height: `${BARCODE_HEIGHT_MM * scale}mm`, width: "100%" }}>
        <Barcode value={data.barcode} className="h-full w-full" />
      </div>
    </div>
  );
}
