"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { TopProductRow } from "@/lib/dummy-data/sales";
import { useMounted } from "@/lib/useMounted";

export function TopProductsChart({ data }: { data: TopProductRow[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-80 w-full" />;

  const top = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  const options: Highcharts.Options = {
    chart: { type: "bar", backgroundColor: "transparent", height: 320 },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: { categories: top.map((d) => d.name), labels: { style: { color: "#7c7264", fontSize: "11px" } } },
    yAxis: {
      title: { text: undefined },
      labels: { style: { color: "#7c7264" } },
      gridLineColor: "rgba(43,36,29,0.08)",
    },
    legend: { enabled: false },
    tooltip: { valuePrefix: "₹" },
    plotOptions: { bar: { borderRadius: 4, color: "#cba15b" } },
    series: [{ type: "bar", name: "Revenue", data: top.map((d) => d.revenue) }],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
