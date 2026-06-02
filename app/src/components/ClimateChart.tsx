import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Filler,
} from "chart.js";
import type { ChartData, ChartDataset, ChartOptions } from "chart.js";
import { Chart } from "react-chartjs-2";
import type { MonthClimate } from "../destinations/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Filler,
);

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const ORANGE = "#fb923c";
const BLUE = "#60a5fa";

type Props = {
  climate: MonthClimate[];
  highlightMonth?: number; // 1-12
};

export function ClimateChart({ climate, highlightMonth }: Props) {
  const hi = highlightMonth ? highlightMonth - 1 : -1;
  const maxRain = Math.max(...climate.map((c) => c.rainMm), 50);

  const data: ChartData<"bar" | "line", number[], string> = useMemo(() => ({
    labels: MONTHS,
    datasets: [
      {
        type: "bar" as const,
        label: "Lluvia",
        yAxisID: "rain",
        data: climate.map((c) => c.rainMm),
        backgroundColor: climate.map((_, i) =>
          i === hi ? "rgba(125,211,252,0.95)" : "rgba(56,189,252,0.45)"),
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.72,
        categoryPercentage: 0.8,
        order: 3,
      },
      {
        type: "line" as const,
        label: "Máx",
        yAxisID: "temp",
        data: climate.map((c) => c.highC),
        borderColor: ORANGE,
        backgroundColor: "rgba(249,115,22,0.18)",
        borderWidth: 2.5,
        tension: 0.4,
        fill: "+1",
        pointRadius: climate.map((_, i) => (i === hi ? 5 : 0)),
        pointHoverRadius: 5,
        pointBackgroundColor: ORANGE,
        pointBorderColor: "#172238",
        pointBorderWidth: 2,
        order: 1,
      },
      {
        type: "line" as const,
        label: "Mín",
        yAxisID: "temp",
        data: climate.map((c) => c.lowC),
        borderColor: BLUE,
        backgroundColor: "transparent",
        borderWidth: 2.5,
        tension: 0.4,
        fill: false,
        pointRadius: climate.map((_, i) => (i === hi ? 5 : 0)),
        pointHoverRadius: 5,
        pointBackgroundColor: BLUE,
        pointBorderColor: "#172238",
        pointBorderWidth: 2,
        order: 2,
      },
    ],
  }), [climate, hi]);

  const options: ChartOptions<"bar"> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    animation: { duration: 650 },
    layout: { padding: { top: 8 } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
        border: { color: "#2c3a58" },
      },
      temp: {
        position: "left",
        suggestedMin: Math.min(...climate.map((c) => c.lowC)) - 3,
        suggestedMax: Math.max(...climate.map((c) => c.highC)) + 3,
        grid: { color: "rgba(44,58,88,0.5)" },
        ticks: { color: "#94a3b8", font: { size: 10 }, callback: (v) => `${v}°` },
        border: { display: false },
      },
      rain: {
        position: "right",
        beginAtZero: true,
        max: maxRain * 2.4, // mantiene las barras en el tercio inferior
        grid: { drawOnChartArea: false },
        ticks: {
          color: "#7591b8",
          font: { size: 10 },
          callback: (v) => (Number(v) <= maxRain * 1.1 ? `${v}mm` : ""),
        },
        border: { display: false },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "#0e1726",
        borderColor: "#2c3a58",
        borderWidth: 1,
        padding: 10,
        titleColor: "#e8edf7",
        bodyColor: "#cbd5e1",
        callbacks: {
          title: (items) => MONTHS[items[0].dataIndex],
          label: (item) => {
            const i = item.dataIndex;
            if (item.dataset.label === "Lluvia") {
              const sea = climate[i].seaTempC;
              return ` 🌧 ${climate[i].rainMm} mm${sea ? ` · 🌊 ${sea}°` : ""}`;
            }
            if (item.dataset.label === "Máx") return ` ☀️ Máx ${climate[i].highC}°`;
            return ` ❄️ Mín ${climate[i].lowC}°`;
          },
        },
      },
    },
  }), [climate, maxRain]);

  return (
    <div className="climate-chart-box">
      <Chart
        type="bar"
        data={data as ChartData<"bar", number[], string> & { datasets: ChartDataset<"bar" | "line", number[]>[] }}
        options={options}
        aria-label="Clima mensual"
      />
    </div>
  );
}
