"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMounted } from "@/lib/useMounted";

export interface BreakdownBarRow {
  name: string;
  value: number;
}

export function BreakdownBarChart({ data, seriesName = "Amount", valuePrefix = "₹" }: { data: BreakdownBarRow[]; seriesName?: string; valuePrefix?: string }) {
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
    legend: { enabled: false },
    tooltip: { valuePrefix },
    plotOptions: { column: { borderRadius: 6, color: "#cba15b" } },
    series: [{ type: "column", name: seriesName, data: data.map((d) => d.value) }],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
