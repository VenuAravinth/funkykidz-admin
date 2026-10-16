"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { SupplierPerformanceRow } from "@/lib/dummy-data/suppliers";
import { useMounted } from "@/lib/useMounted";

export function SupplierPerformanceChart({ rows }: { rows: SupplierPerformanceRow[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-80 w-full" />;

  const top = rows.slice(0, 8);

  const options: Highcharts.Options = {
    chart: { type: "bar", backgroundColor: "transparent", height: 320 },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: { categories: top.map((r) => r.supplier.name), labels: { style: { color: "#7c7264", fontSize: "11px" } } },
    yAxis: {
      max: 100,
      title: { text: undefined },
      labels: { style: { color: "#7c7264" } },
      gridLineColor: "rgba(43,36,29,0.08)",
    },
    legend: { itemStyle: { color: "#2b241d" } },
    tooltip: { valueSuffix: "%" },
    plotOptions: { bar: { borderRadius: 4 } },
    series: [
      { type: "bar", name: "On-Time Delivery", data: top.map((r) => r.onTimeRate), color: "#cba15b" },
      { type: "bar", name: "Defect Rate", data: top.map((r) => r.defectRate), color: "#e57373" },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
