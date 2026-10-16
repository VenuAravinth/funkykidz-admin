export const labelSizes = ["40x25", "50x30", "63x38"] as const;
export type LabelSize = (typeof labelSizes)[number];

export const LABEL_DIMENSIONS_MM: Record<LabelSize, { width: number; height: number }> = {
  "40x25": { width: 40, height: 25 },
  "50x30": { width: 50, height: 30 },
  "63x38": { width: 63, height: 38 },
};

export interface BarcodeSettings {
  labelSize: LabelSize;
  showStoreName: boolean;
  showPrice: boolean;
  defaultQuantity: number;
}

export interface BarcodeBatch {
  id: string;
  productId: string;
  variantId?: string;
  barcode: string;
  quantity: number;
  generatedBy: string;
  generatedAt: string;
}
