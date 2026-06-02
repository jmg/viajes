import type { Destination } from "../destinations/types";
import { CATEGORY_EMOJI, CATEGORY_LABEL, COST_LABEL, COST_RANGE_USD } from "../destinations/types";
import { rateClimate } from "../lib/recommender";
import { ClimateChart } from "./ClimateChart";

const MONTHS_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

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

/** Catmull-Rom → cubic Bézier para una curva suave. */
function smoothPath(pts: readonly (readonly [number, number])[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function TempSparkline({ climate }: { climate: { highC: number; lowC: number }[] }) {
  const W = 600, H = 72;
  // Banda donde vive la curva; deja aire arriba/abajo para las etiquetas.
  const TOP = 22, BOT = 50;
  const avgs = climate.map((c) => (c.highC + c.lowC) / 2);
  const min = Math.min(...avgs);
  const max = Math.max(...avgs);
  const range = max - min || 1;
  const pts = avgs.map((t, i) => {
    const x = (i / 11) * W;
    const y = BOT - ((t - min) / range) * (BOT - TOP);
    return [x, y] as const;
  });
  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;
  const maxI = avgs.indexOf(max);
  const minI = avgs.indexOf(min);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="temp-sparkline" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} className="sparkline-fill" fill="url(#spark-fill)" />
      <path d={linePath} className="sparkline-line" />
      {[maxI, minI].map((idx) => (
        <g key={idx}>
          <circle cx={pts[idx][0]} cy={pts[idx][1]} r={3.5} className="sparkline-dot" />
          <text
            x={Math.min(Math.max(pts[idx][0], 16), W - 16)}
            y={idx === maxI ? pts[idx][1] - 9 : pts[idx][1] + 17}
            className="sparkline-label"
          >
            {Math.round(avgs[idx])}°
          </text>
        </g>
      ))}
    </svg>
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
