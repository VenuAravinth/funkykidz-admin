"use client";

import { useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { SalesTrendPoint } from "@/lib/dummy-data/sales";
import { useMounted } from "@/lib/useMounted";
import { cn } from "@/lib/cn";

type TrendRange = "daily" | "weekly" | "monthly";

const RANGE_TABS: { key: TrendRange; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

export interface SalesTrendChartProps {
  daily: SalesTrendPoint[];
  weekly: SalesTrendPoint[];
  monthly: SalesTrendPoint[];
}

export function SalesTrendChart({ daily, weekly, monthly }: SalesTrendChartProps) {
  const mounted = useMounted();
  const [range, setRange] = useState<TrendRange>("daily");

  const data = range === "daily" ? daily : range === "weekly" ? weekly : monthly;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-full border border-glass-border bg-white/50 p-1 backdrop-blur-sm">
          {RANGE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setRange(tab.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                range === tab.key ? "bg-champagne-500 text-white shadow-sm" : "text-ink-muted hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!mounted ? (
        <div className="h-72 w-full" />
      ) : (
        <HighchartsReact
          highcharts={Highcharts}
          options={
            {
              chart: { type: "area", backgroundColor: "transparent", height: 280 },
              title: { text: undefined },
              credits: { enabled: false },
              xAxis: { categories: data.map((d) => d.label), labels: { style: { color: "#7c7264", fontSize: "11px" } } },
              yAxis: {
                title: { text: undefined },
                labels: { style: { color: "#7c7264" } },
                gridLineColor: "rgba(43,36,29,0.08)",
              },
              legend: { enabled: false },
              tooltip: { valuePrefix: "₹" },
              plotOptions: {
                area: {
                  color: "#cba15b",
                  lineWidth: 2,
                  marker: { radius: 4, fillColor: "#cba15b", lineWidth: 0 },
                  fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                      [0, "rgba(203,161,91,0.35)"],
                      [1, "rgba(203,161,91,0.02)"],
                    ],
                  },
                },
              },
              series: [{ type: "area", name: "Sales", data: data.map((d) => d.amount) }],
            } satisfies Highcharts.Options
          }
        />
      )}
    </div>
  );
}
