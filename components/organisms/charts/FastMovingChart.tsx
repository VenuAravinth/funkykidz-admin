"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMounted } from "@/lib/useMounted";

export interface FastMovingRow {
  name: string;
  unitsSold: number;
}

export function FastMovingChart({ data }: { data: FastMovingRow[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-72 w-full" />;

  const top = data.slice(0, 8);

  const options: Highcharts.Options = {
    chart: { type: "column", backgroundColor: "transparent", height: 280 },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: { categories: top.map((d) => d.name), labels: { style: { color: "#7c7264", fontSize: "11px" } } },
    yAxis: {
      title: { text: undefined },
      labels: { style: { color: "#7c7264" } },
      gridLineColor: "rgba(43,36,29,0.08)",
    },
    legend: { enabled: false },
    tooltip: { valueSuffix: " units" },
    plotOptions: { column: { borderRadius: 6, color: "#cba15b" } },
    series: [{ type: "column", name: "Units Sold", data: top.map((d) => d.unitsSold) }],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
