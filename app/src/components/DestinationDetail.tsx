import type { Destination } from "../destinations/types";
import { CATEGORY_EMOJI, CATEGORY_LABEL, COST_LABEL, COST_RANGE_USD } from "../destinations/types";
import { rateClimate } from "../lib/recommender";
import { ClimateChart } from "./ClimateChart";

const MONTHS_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

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
        <div className="months-grid">
          {MONTHS_FULL.map((m, i) => {
            const monthNum = i + 1;
            const isBest = d.bestMonths.includes(monthNum);
            const climate = d.climate[i];
            const rating = rateClimate(climate);
            return (
              <div key={i} className={`month-cell rating-${rating.rating} ${isBest ? "best" : ""}`}>
                <div className="month-name">{m.slice(0, 3)}</div>
                <div className="month-temp">{climate.lowC}°/{climate.highC}°</div>
                <div className="month-rain">{climate.rainMm}mm</div>
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
