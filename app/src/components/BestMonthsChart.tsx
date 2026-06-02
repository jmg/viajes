import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import type { MonthClimate } from "../destinations/types";
import { rateClimate } from "../lib/recommender";

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip);

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MONTHS_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const SCORE: Record<string, number> = { ideal: 100, good: 75, ok: 48, avoid: 20 };
const COLOR: Record<string, string> = { ideal: "#34d399", good: "#38bdf8", ok: "#fbbf24", avoid: "#f87171" };
const RATING_TXT: Record<string, string> = { ideal: "Ideal", good: "Bueno", ok: "Aceptable", avoid: "Evitar" };

type Props = {
  climate: MonthClimate[];
  bestMonths: number[];
  highlightMonth?: number; // 1-12
};

export function BestMonthsChart({ climate, highlightMonth }: Props) {
  const hi = highlightMonth ? highlightMonth - 1 : -1;
  const ratings = climate.map((c) => rateClimate(c).rating);

  const data: ChartData<"bar", number[], string> = useMemo(() => ({
    labels: MONTHS,
    datasets: [{
      data: ratings.map((r) => SCORE[r]),
      backgroundColor: ratings.map((r) => COLOR[r]),
      borderColor: ratings.map((_, i) => (i === hi ? "#fff" : "transparent")),
      borderWidth: ratings.map((_, i) => (i === hi ? 2 : 0)),
      borderRadius: 6,
      borderSkipped: false,
    }],
  }), [climate, hi]);

  const options: ChartOptions<"bar"> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 11 } }, border: { color: "#2c3a58" } },
      y: { display: false, min: 0, max: 110 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0e1726", borderColor: "#2c3a58", borderWidth: 1, padding: 10,
        titleColor: "#e8edf7", bodyColor: "#cbd5e1",
        callbacks: {
          title: (items) => MONTHS_FULL[items[0].dataIndex],
          label: (item) => {
            const c = climate[item.dataIndex];
            return [
              ` ${RATING_TXT[ratings[item.dataIndex]]}`,
              ` 🌡 ${c.lowC}° – ${c.highC}°`,
              ` 🌧 ${c.rainMm} mm`,
            ];
          },
        },
      },
    },
  }), [climate, ratings]);

  return (
    <div className="best-months-chart">
      <div className="bmc-canvas">
        <Bar data={data} options={options} aria-label="Aptitud climática por mes" />
      </div>
      <div className="best-months-legend">
        <span><i style={{ background: COLOR.ideal }} /> Ideal</span>
        <span><i style={{ background: COLOR.good }} /> Bueno</span>
        <span><i style={{ background: COLOR.ok }} /> Aceptable</span>
        <span><i style={{ background: COLOR.avoid }} /> Evitar</span>
      </div>
    </div>
  );
}
