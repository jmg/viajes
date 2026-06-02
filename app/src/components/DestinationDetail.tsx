import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  Tooltip,
  Filler,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import type { Destination } from "../destinations/types";
import type { Trip } from "../types";
import { CATEGORY_EMOJI, CATEGORY_LABEL, COST_LABEL, COST_RANGE_USD } from "../destinations/types";
import { rateClimate } from "../lib/recommender";
import { ClimateChart } from "./ClimateChart";
import { WeatherSection } from "./WeatherSection";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Tooltip, Filler);

const MONTHS_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/** Viaje sintético para previsualizar el clima real (Open-Meteo) de un destino en el mes elegido. */
function previewTrip(d: Destination, month?: number): Trip {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  let year = now.getFullYear();
  if (m <= now.getMonth() + 1) year += 1;
  const dur = Math.min(Math.max(d.suggestedDuration?.min ?? 7, 5), 10);
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m - 1, dur);
  const fmt = (x: Date) => x.toISOString().slice(0, 10);
  return {
    id: `preview-${d.id}`,
    title: d.name,
    startDate: fmt(start),
    endDate: fmt(end),
    origin: "",
    destinations: [d.name],
    travelers: 1,
    status: "planning",
  };
}

function tempBucket(t: number): string {
  if (t < 0) return "temp-frigid";
  if (t < 10) return "temp-cold";
  if (t < 18) return "temp-cool";
  if (t < 26) return "temp-warm";
  if (t < 32) return "temp-hot";
  return "temp-scorching";
}

function rainIcon(mm: number): string {
  if (mm < 20) return "☀";
  if (mm < 70) return "🌦";
  if (mm < 150) return "🌧";
  return "🌧🌧";
}

function TempSparkline({ climate }: { climate: { highC: number; lowC: number }[] }) {
  const avgs = climate.map((c) => Math.round((c.highC + c.lowC) / 2));
  const maxI = avgs.indexOf(Math.max(...avgs));
  const minI = avgs.indexOf(Math.min(...avgs));

  const data: ChartData<"line", number[], string> = {
    labels: MONTHS_FULL,
    datasets: [{
      data: avgs,
      borderColor: "#fb923c",
      borderWidth: 2.5,
      tension: 0.4,
      fill: true,
      backgroundColor: (ctx) => {
        const { chart } = ctx;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return "rgba(249,115,22,0.15)";
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, "rgba(249,115,22,0.30)");
        g.addColorStop(1, "rgba(249,115,22,0)");
        return g;
      },
      pointRadius: avgs.map((_, i) => (i === maxI || i === minI ? 4 : 0)),
      pointHoverRadius: 4,
      pointBackgroundColor: avgs.map((_, i) => (i === minI ? "#60a5fa" : "#fb923c")),
      pointBorderColor: "#172238",
      pointBorderWidth: 2,
    }],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    animation: { duration: 600 },
    scales: { x: { display: false }, y: { display: false, grace: "18%" } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0e1726",
        borderColor: "#2c3a58",
        borderWidth: 1,
        padding: 9,
        titleColor: "#e8edf7",
        bodyColor: "#cbd5e1",
        callbacks: { label: (item) => ` ${item.parsed.y}° promedio` },
      },
    },
  };

  return (
    <div className="temp-sparkline-box">
      <Line data={data} options={options} aria-label="Temperatura promedio mensual" />
    </div>
  );
}

const VISA_LABEL = {
  none: "Sin visa",
  evisa: "E-visa",
  required: "Visa requerida",
};

type Props = {
  destination: Destination;
  highlightMonth?: number;
  isInWishlist: boolean;
  onToggleWishlist: () => void;
  onCreateTrip: () => void;
};

export function DestinationDetail({ destination: d, highlightMonth, isInWishlist, onToggleWishlist, onCreateTrip }: Props) {
  return (
    <div className="dest-detail">
      <div className="dest-detail-header">
        <span className="dest-flag-big">{d.flag}</span>
        <div>
          <h2>{d.name}</h2>
          <p className="dest-country">{d.country} · {d.region}</p>
          <a
            className="maps-link"
            href={
              d.lat != null && d.lng != null
                ? `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.name}, ${d.country}`)}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            📍 Ver en Google Maps
          </a>
        </div>
        <button
          className={`wishlist-btn large ${isInWishlist ? "active" : ""}`}
          onClick={onToggleWishlist}
          title={isInWishlist ? "Quitar de la lista" : "Guardar en wishlist"}
        >
          {isInWishlist ? "❤️" : "🤍"}
        </button>
      </div>

      <p className="dest-desc lead">{d.description}</p>

      <div className="dest-stats">
        <div className="stat">
          <span className="stat-label">Costo diario</span>
          <span className="stat-value">{COST_LABEL[d.costTier]}</span>
          <span className="stat-sub">US$ {COST_RANGE_USD[d.costTier]}</span>
        </div>
        {d.flightHoursFromEze !== undefined && (
          <div className="stat">
            <span className="stat-label">Vuelo desde EZE</span>
            <span className="stat-value">{d.flightHoursFromEze}h</span>
          </div>
        )}
        {d.visaForArgentines && (
          <div className="stat">
            <span className="stat-label">Para argentinos</span>
            <span className="stat-value">{VISA_LABEL[d.visaForArgentines]}</span>
          </div>
        )}
        {d.suggestedDuration && (
          <div className="stat">
            <span className="stat-label">Días sugeridos</span>
            <span className="stat-value">{d.suggestedDuration.min}–{d.suggestedDuration.max}</span>
          </div>
        )}
      </div>

      <div className="dest-section">
        <h3>Clima durante el año</h3>
        <ClimateChart climate={d.climate} highlightMonth={highlightMonth} />
        {highlightMonth && (
          <p className="climate-month-summary">
            <strong>{MONTHS_FULL[highlightMonth - 1]}:</strong>{" "}
            {d.climate[highlightMonth - 1].lowC}° – {d.climate[highlightMonth - 1].highC}°C ·{" "}
            {d.climate[highlightMonth - 1].rainMm} mm de lluvia
            {d.climate[highlightMonth - 1].seaTempC && ` · mar ${d.climate[highlightMonth - 1].seaTempC}°C`}
          </p>
        )}
        <WeatherSection trip={previewTrip(d, highlightMonth)} />
      </div>

      <div className="dest-section">
        <h3>Mejores meses</h3>
        <TempSparkline climate={d.climate} />
        <div className="months-grid">
          {MONTHS_FULL.map((m, i) => {
            const monthNum = i + 1;
            const isBest = d.bestMonths.includes(monthNum);
            const climate = d.climate[i];
            const rating = rateClimate(climate);
            const avgTemp = (climate.highC + climate.lowC) / 2;
            return (
              <div
                key={i}
                className={`month-cell rating-${rating.rating} ${isBest ? "best" : ""} ${tempBucket(avgTemp)}`}
                title={`${m} · ${climate.lowC}°/${climate.highC}° · ${climate.rainMm} mm`}
              >
                <div className="month-name">{m.slice(0, 3)}</div>
                <div className="month-temp">{climate.lowC}°/{climate.highC}°</div>
                <div className="month-rain">{rainIcon(climate.rainMm)} {climate.rainMm}mm</div>
                {isBest && <div className="month-star">⭐</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="dest-section">
        <h3>Categorías</h3>
        <div className="dest-categories">
          {d.categories.map((c) => (
            <span key={c} className="cat-chip">
              {CATEGORY_EMOJI[c]} {CATEGORY_LABEL[c]}
            </span>
          ))}
        </div>
      </div>

      <div className="dest-section">
        <h3>Lo imperdible</h3>
        <ul className="highlights-list">
          {d.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>

      <div className="dest-actions">
        <button className="button-primary large" onClick={onCreateTrip}>
          ✈️ Planear viaje a {d.name}
        </button>
      </div>
    </div>
  );
}
