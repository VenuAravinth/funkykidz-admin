"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { PurchaseReportRow } from "@/lib/dummy-data/suppliers";
import { useMounted } from "@/lib/useMounted";

export function PurchaseByCategoryChart({ data }: { data: PurchaseReportRow[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-72 w-full" />;

  const options: Highcharts.Options = {
    chart: { type: "column", backgroundColor: "transparent", height: 280 },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: { categories: data.map((d) => d.category), labels: { style: { color: "#7c7264" } } },
    yAxis: {
      title: { text: undefined },
      labels: { style: { color: "#7c7264" } },
      gridLineColor: "rgba(43,36,29,0.08)",
    },
    legend: { enabled: false },
    tooltip: { valuePrefix: "₹" },
    plotOptions: { column: { borderRadius: 6, color: "#cba15b" } },
    series: [{ type: "column", name: "Purchase Amount", data: data.map((d) => d.totalAmount) }],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
