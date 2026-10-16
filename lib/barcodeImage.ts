"use client";

import JsBarcode from "jsbarcode";
import { formatCurrency } from "@/lib/format";
import { isValidEan13, type SellableUnit } from "@/lib/barcode";

const LABEL_W = 591;
const LABEL_H = 354;

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

type LabelUnit = Pick<SellableUnit, "productName" | "variantLabel" | "barcode" | "price">;

export function renderBarcodeLabel(unit: LabelUnit): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = LABEL_W;
  canvas.height = LABEL_H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, LABEL_W, LABEL_H);
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  ctx.font = "bold 22px sans-serif";
  ctx.fillText("FUNKY KIDS", LABEL_W / 2, 14);
  ctx.font = "600 30px sans-serif";
  ctx.fillText(fitText(ctx, unit.productName, LABEL_W - 40), LABEL_W / 2, 42);
  ctx.font = "26px sans-serif";
  ctx.fillText(fitText(ctx, [unit.variantLabel, formatCurrency(unit.price)].filter(Boolean).join("  ·  "), LABEL_W - 40), LABEL_W / 2, 80);

  const bars = document.createElement("canvas");
  JsBarcode(bars, unit.barcode, {
    format: isValidEan13(unit.barcode) ? "EAN13" : "CODE128",
    width: 4,
    height: 150,
    margin: 0,
    fontSize: 30,
    textMargin: 4,
    displayValue: true,
  });
  const maxW = LABEL_W - 40;
  const scale = Math.min(1, maxW / bars.width);
  const w = bars.width * scale;
  const h = bars.height * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bars, (LABEL_W - w) / 2, LABEL_H - h - 14, w, h);
  return canvas;
}

function renderLabelSheet(units: LabelUnit[]): HTMLCanvasElement {
  const cols = Math.min(2, units.length);
  const rows = Math.ceil(units.length / cols);
  const gap = 24;
  const sheet = document.createElement("canvas");
  sheet.width = cols * LABEL_W + (cols + 1) * gap;
  sheet.height = rows * LABEL_H + (rows + 1) * gap;
  const ctx = sheet.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sheet.width, sheet.height);
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = "#bbbbbb";
  units.forEach((unit, i) => {
    const x = gap + (i % cols) * (LABEL_W + gap);
    const y = gap + Math.floor(i / cols) * (LABEL_H + gap);
    ctx.drawImage(renderBarcodeLabel(unit), x, y);
    ctx.strokeRect(x - 0.5, y - 0.5, LABEL_W + 1, LABEL_H + 1);
  });
  return sheet;
}

function saveCanvas(canvas: HTMLCanvasElement, fileName: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

export function downloadBarcodeLabels(units: LabelUnit[], baseName: string) {
  if (units.length === 0) return;
  if (units.length === 1) saveCanvas(renderBarcodeLabel(units[0]), `${baseName}-barcode-${units[0].barcode}.png`);
  else saveCanvas(renderLabelSheet(units), `${baseName}-barcodes-${units.length}-labels.png`);
}
