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
import { useT } from "../i18n";
import { MONTHS_SHORT } from "../i18n/dates";
import { getLang } from "../i18n/core";
import { monthName } from "../lib/format";

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip);

const SCORE: Record<string, number> = { ideal: 100, good: 75, ok: 48, avoid: 20 };
const COLOR: Record<string, string> = { ideal: "#34d399", good: "#38bdf8", ok: "#fbbf24", avoid: "#f87171" };
const RATING_KEY: Record<string, string> = { ideal: "charts.ideal", good: "charts.good", ok: "charts.ok", avoid: "charts.avoid" };

type Props = {
  climate: MonthClimate[];
  bestMonths: number[];
  highlightMonth?: number; // 1-12
};

export function BestMonthsChart({ climate, highlightMonth }: Props) {
  const t = useT();
  const MONTHS = MONTHS_SHORT[getLang()];
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
  }), [climate, hi, MONTHS]);

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
          title: (items) => monthName(items[0].dataIndex + 1),
          label: (item) => {
            const c = climate[item.dataIndex];
            return [
              ` ${t(RATING_KEY[ratings[item.dataIndex]])}`,
              ` 🌡 ${c.lowC}° – ${c.highC}°`,
              ` 🌧 ${c.rainMm} mm`,
            ];
          },
        },
      },
    },
  }), [climate, ratings, t]);

  return (
    <div className="best-months-chart">
      <div className="bmc-canvas">
        <Bar data={data} options={options} aria-label={t("charts.ratingAria")} />
      </div>
      <div className="best-months-legend">
        <span><i style={{ background: COLOR.ideal }} /> {t("charts.ideal")}</span>
        <span><i style={{ background: COLOR.good }} /> {t("charts.good")}</span>
        <span><i style={{ background: COLOR.ok }} /> {t("charts.ok")}</span>
        <span><i style={{ background: COLOR.avoid }} /> {t("charts.avoid")}</span>
      </div>
    </div>
  );
}
