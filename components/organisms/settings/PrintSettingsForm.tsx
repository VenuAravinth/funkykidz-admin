"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { paperSizes, printTemplates, type PrintSettings } from "@/types/settings";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectPrintSettings, updatePrintSettings, updateReceiptConfig } from "@/stores/slices/settingsSlice";

const RECEIPT_TOGGLES: Array<{ key: keyof PrintSettings["receiptConfig"]; label: string }> = [
  { key: "logo", label: "Logo" },
  { key: "storeName", label: "Store name" },
  { key: "address", label: "Address" },
  { key: "phone", label: "Phone" },
  { key: "gstin", label: "GSTIN" },
  { key: "customer", label: "Customer" },
  { key: "products", label: "Products" },
  { key: "discount", label: "Discount" },
  { key: "tax", label: "Tax" },
  { key: "roundOff", label: "Round off" },
  { key: "paymentMethod", label: "Payment method" },
  { key: "cashier", label: "Cashier" },
];

export function PrintSettingsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectPrintSettings);
  const [saved, setSaved] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<Omit<PrintSettings, "receiptConfig">>({
    defaultValues: {
      receiptPrinterName: settings.receiptPrinterName,
      paperSize: settings.paperSize,
      autoPrint: settings.autoPrint,
      invoicePrinterName: settings.invoicePrinterName,
      invoiceCopies: settings.invoiceCopies,
    },
  });

  const onSubmit = handleSubmit((values) => {
    dispatch(updatePrintSettings(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  function runTestPrint(label: string) {
    setTestMessage(`${label} sent to the configured printer.`);
    setTimeout(() => setTestMessage(null), 2500);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {saved && <FormAlert variant="success">Print settings updated.</FormAlert>}
      {testMessage && <FormAlert variant="success">{testMessage}</FormAlert>}

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Printer</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="receiptPrinterName" label="Receipt printer">
            <Input id="receiptPrinterName" placeholder="Select printer…" {...register("receiptPrinterName")} />
          </FormField>
          <FormField id="paperSize" label="Paper size">
            <Select id="paperSize" {...register("paperSize")}>
              {paperSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <div className="mt-4">
          <CheckboxField id="autoPrint" label="Auto print" {...register("autoPrint")} />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Invoice printer</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="invoicePrinterName" label="A4 printer">
            <Input id="invoicePrinterName" placeholder="Select printer…" {...register("invoicePrinterName")} />
          </FormField>
          <FormField id="invoiceCopies" label="Copies">
            <Input id="invoiceCopies" type="number" min={1} max={5} {...register("invoiceCopies", { valueAsNumber: true })} />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Receipt configuration</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RECEIPT_TOGGLES.map((toggle) => (
            <CheckboxField
              key={toggle.key}
              id={`receiptConfig-${toggle.key}`}
              label={toggle.label}
              checked={settings.receiptConfig[toggle.key]}
              onChange={(e) => dispatch(updateReceiptConfig({ [toggle.key]: e.target.checked }))}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Test print</h3>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => runTestPrint("Test receipt")}>
            Test Receipt
          </Button>
          <Button type="button" variant="secondary" onClick={() => runTestPrint("Test invoice")}>
            Test Invoice
          </Button>
          <Button type="button" variant="secondary" onClick={() => runTestPrint("Test barcode")}>
            Test Barcode
          </Button>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Print templates</h3>
        <Card className="p-4">
          <ul className="grid grid-cols-1 gap-2 text-sm text-ink sm:grid-cols-2">
            {printTemplates.map((template) => (
              <li key={template} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-champagne-500" />
                {template}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <div>
        <Button type="submit">Save Print Settings</Button>
      </div>
    </form>
  );
}
