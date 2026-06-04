import type { Destination } from "../destinations/types";
import type { Trip } from "../types";
import { CATEGORY_EMOJI, COST_RANGE_USD } from "../destinations/types";
import type { Airport } from "../lib/airports";
import { flightHoursFromOrigin } from "../lib/originFlight";
import { rateClimate } from "../lib/recommender";
import { ClimateChart } from "./ClimateChart";
import { BestMonthsChart } from "./BestMonthsChart";
import { WeatherSection } from "./WeatherSection";
import { InfoTip as Info } from "./InfoTip";
import { useT } from "../i18n";
import { catLabel, costLabel, ratingLabel, ratingTip, visaLabel } from "../i18n/labels";
import { monthName } from "../lib/format";

/** Viaje sintético para previsualizar el clima real (Open-Meteo) de un destino en el mes elegido. */
function previewTrip(d: Destination, month?: number): Trip {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  let year = now.getFullYear();
  if (m <= now.getMonth() + 1) year += 1;
  // Mes completo: WeatherSection muestra ~10 días salteados de a 3 (1, 4, 7, …).
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m - 1, 28);
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

function rainTextKey(mm: number): string {
  if (mm < 30) return "destDetail.dry";
  if (mm < 100) return "destDetail.rainModerate";
  if (mm < 200) return "destDetail.rainy";
  return "destDetail.veryRainy";
}

type Props = {
  destination: Destination;
  highlightMonth?: number;
  isInWishlist: boolean;
  origin?: Airport | null;
  onToggleWishlist: () => void;
  onCreateTrip: () => void;
};

export function DestinationDetail({ destination: d, highlightMonth, isInWishlist, origin, onToggleWishlist, onCreateTrip }: Props) {
  const t = useT();
  const flightHours = flightHoursFromOrigin(d, origin ?? null);
  const fromCode = origin?.code ?? "EZE";
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
            {t("destDetail.viewOnMaps")}
          </a>
        </div>
        <button
          className={`wishlist-btn large ${isInWishlist ? "active" : ""}`}
          onClick={onToggleWishlist}
          title={isInWishlist ? t("destDetail.removeTitle") : t("destDetail.saveTitle")}
        >
          {isInWishlist ? "❤️" : "🤍"}
        </button>
      </div>

      <p className="dest-desc lead">{d.description}</p>

      <div className="dest-stats">
        <div className="stat">
          <span className="stat-label">{t("destDetail.dailyCost")}</span>
          <span className="stat-value">{costLabel(d.costTier)}</span>
          <span className="stat-sub">US$ {COST_RANGE_USD[d.costTier]}</span>
        </div>
        {flightHours !== undefined && (
          <div className="stat">
            <span className="stat-label">{t("destDetail.flightFrom", { code: fromCode })}</span>
            <span className="stat-value">{flightHours}h</span>
          </div>
        )}
        {d.visaForArgentines && (
          <div className="stat">
            <span className="stat-label">{t("destDetail.forArgentines")}</span>
            <span className="stat-value">{visaLabel(d.visaForArgentines)}</span>
          </div>
        )}
        {d.suggestedDuration && (
          <div className="stat">
            <span className="stat-label">{t("destDetail.suggestedDays")}</span>
            <span className="stat-value">{d.suggestedDuration.min}–{d.suggestedDuration.max}</span>
          </div>
        )}
      </div>

      <div className="dest-section">
        <h3>{t("destDetail.climateYear")}</h3>
        <ClimateChart climate={d.climate} highlightMonth={highlightMonth} />
        {highlightMonth && (() => {
          const cm = d.climate[highlightMonth - 1];
          const rating = rateClimate(cm).rating;
          const avg = Math.round((cm.highC + cm.lowC) / 2);
          const info = RATING_INFO[rating];
          return (
            <div className="month-panel">
              <div className="month-panel-head">
                <strong>{MONTHS_FULL[highlightMonth - 1]}</strong>
                <span className={`rating-pill rating-${rating}`}>{info.label}<Info tip={info.tip} /></span>
                {d.bestMonths.includes(highlightMonth) && (
                  <span className="best-badge">⭐ Uno de los mejores meses para ir</span>
                )}
              </div>
              <div className="month-stats">
                <div className="ms">
                  <span className="ms-label">Temperatura</span>
                  <span className="ms-val">{cm.lowC}° – {cm.highC}°</span>
                  <span className="ms-sub">promedio {avg}°</span>
                </div>
                <div className="ms">
                  <span className="ms-label">Lluvia <Info tip="Milímetros de lluvia que caen en todo el mes (promedio histórico). Menos de 30 mm es seco; más de 200, muy lluvioso." /></span>
                  <span className="ms-val">{cm.rainMm} mm</span>
                  <span className="ms-sub">{rainText(cm.rainMm)}</span>
                </div>
                {cm.seaTempC != null && (
                  <div className="ms">
                    <span className="ms-label">Mar <Info tip="Temperatura promedio del agua del mar. Desde ~24° se siente cálida para nadar." /></span>
                    <span className="ms-val">{cm.seaTempC}°</span>
                    <span className="ms-sub">{cm.seaTempC >= 24 ? "cálido" : "fresco"}</span>
                  </div>
                )}
                {cm.sunHours != null && (
                  <div className="ms">
                    <span className="ms-label">Sol <Info tip="Horas de sol promedio por día en el mes." /></span>
                    <span className="ms-val">{cm.sunHours} h</span>
                    <span className="ms-sub">por día</span>
                  </div>
                )}
              </div>
              <p className="month-panel-note">
                Valores de clima típico (normales). Abajo, el clima real día a día (promedio de años pasados).
              </p>
            </div>
          );
        })()}
        <WeatherSection trip={previewTrip(d, highlightMonth)} sampleEvery={3} maxDays={10} />
      </div>

      <div className="dest-section">
        <h3>¿Cuándo ir? Aptitud por mes</h3>
        <BestMonthsChart climate={d.climate} bestMonths={d.bestMonths} highlightMonth={highlightMonth} />
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
