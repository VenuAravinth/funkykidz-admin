"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { CATEGORICAL_CHART_COLORS } from "@/lib/chartColors";
import { useMounted } from "@/lib/useMounted";

export interface IncomeVsExpenseChartProps {
  incomeByCategory: Array<{ category: string; amount: number }>;
  expenseByCategory: Array<{ category: string; amount: number }>;
}

export function IncomeVsExpenseChart({ incomeByCategory, expenseByCategory }: IncomeVsExpenseChartProps) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-72 w-full" />;

  const categories = [...new Set([...incomeByCategory.map((r) => r.category), ...expenseByCategory.map((r) => r.category)])];
  const incomeByName = new Map(incomeByCategory.map((r) => [r.category, r.amount]));
  const expenseByName = new Map(expenseByCategory.map((r) => [r.category, r.amount]));

  const options: Highcharts.Options = {
    chart: { type: "column", backgroundColor: "transparent", height: 300 },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: { categories, labels: { style: { color: "#7c7264", fontSize: "11px" } } },
    yAxis: { title: { text: undefined }, labels: { style: { color: "#7c7264" } }, gridLineColor: "rgba(43,36,29,0.08)" },
    legend: { itemStyle: { color: "#2b241d", fontSize: "12px" } },
    tooltip: { valuePrefix: "₹", shared: true },
    plotOptions: { column: { borderRadius: 4, groupPadding: 0.15 } },
    series: [
      { type: "column", name: "Income", data: categories.map((c) => incomeByName.get(c) ?? 0), color: CATEGORICAL_CHART_COLORS[2] },
      { type: "column", name: "Expense", data: categories.map((c) => expenseByName.get(c) ?? 0), color: CATEGORICAL_CHART_COLORS[3] },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
