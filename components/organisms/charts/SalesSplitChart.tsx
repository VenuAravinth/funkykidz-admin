"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { CATEGORICAL_CHART_COLORS } from "@/lib/chartColors";
import { useMounted } from "@/lib/useMounted";

export interface SalesSplitRow {
  name: string;
  amount: number;
}

export function SalesSplitChart({ data }: { data: SalesSplitRow[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-72 w-full" />;

  const options: Highcharts.Options = {
    chart: { type: "pie", backgroundColor: "transparent", height: 280 },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { itemStyle: { color: "#2b241d", fontSize: "12px" } },
    tooltip: { valuePrefix: "₹", pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b> (₹{point.y:,.0f})" },
    plotOptions: {
      pie: {
        innerSize: "60%",
        borderWidth: 2,
        borderColor: "#fdfaf5",
        dataLabels: { enabled: true, distance: 12, style: { color: "#7c7264", fontSize: "11px", textOutline: "none" } },
      },
    },
    series: [
      {
        type: "pie",
        name: "Share",
        data: data.map((d, i) => ({ name: d.name, y: d.amount, color: CATEGORICAL_CHART_COLORS[i % CATEGORICAL_CHART_COLORS.length] })),
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
