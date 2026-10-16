"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMounted } from "@/lib/useMounted";

export interface CategoryReportRow {
  name: string;
  stockValue: number;
  profit: number;
}

export function CategoryValueChart({ data }: { data: CategoryReportRow[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-72 w-full" />;

  const options: Highcharts.Options = {
    chart: { type: "column", backgroundColor: "transparent", height: 280 },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: { categories: data.map((d) => d.name), labels: { style: { color: "#7c7264", fontSize: "11px" } } },
    yAxis: {
      title: { text: undefined },
      labels: { style: { color: "#7c7264" } },
      gridLineColor: "rgba(43,36,29,0.08)",
    },
    legend: { itemStyle: { color: "#2b241d" } },
    tooltip: { valuePrefix: "₹" },
    plotOptions: { column: { borderRadius: 6 } },
    series: [
      { type: "column", name: "Stock Value", data: data.map((d) => d.stockValue), color: "#cba15b" },
      { type: "column", name: "Profit", data: data.map((d) => d.profit), color: "#6b9e78" },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
