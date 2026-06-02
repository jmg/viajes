import type { RecommendationResult } from "../destinations/types";
import { CATEGORY_EMOJI, CATEGORY_LABEL, COST_LABEL, COST_RANGE_USD } from "../destinations/types";

const RATING_LABEL = {
  ideal: "🌟 Ideal",
  good: "✅ Bueno",
  ok: "⚠ Aceptable",
  avoid: "❌ Evitar",
};

const RATING_TIP = {
  ideal: "Clima muy cómodo en este mes.",
  good: "Buen clima, con algún detalle menor.",
  ok: "Se puede, pero hay calor, frío o lluvia a tener en cuenta.",
  avoid: "Mes poco recomendable por temperatura o lluvia.",
};

type Props = {
  result: RecommendationResult;
  isInWishlist: boolean;
  onOpen: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onCreateTrip: (id: string) => void;
};

export function DestinationCard({ result, isInWishlist, onOpen, onToggleWishlist, onCreateTrip }: Props) {
  const { destination: d, climateRating, reasons, warnings, score } = result;
  return (
    <div className={`dest-card rating-${climateRating}`}>
      <button className="dest-card-main" onClick={() => onOpen(d.id)}>
        <div className="dest-card-header">
          <span className="dest-flag">{d.flag}</span>
          <div className="dest-name-block">
            <h3>{d.name}</h3>
            <span className="dest-country">{d.country} · {d.region}</span>
          </div>
          <span className={`rating-pill rating-${climateRating}`} title={RATING_TIP[climateRating]}>{RATING_LABEL[climateRating]}</span>
        </div>

        <p className="dest-desc">{d.description}</p>

        <div className="dest-categories">
          {d.categories.slice(0, 5).map((c) => (
            <span key={c} className="cat-chip">
              {CATEGORY_EMOJI[c]} {CATEGORY_LABEL[c]}
            </span>
          ))}
        </div>

        <ul className="dest-reasons">
          {reasons.slice(0, 3).map((r, i) => (
            <li key={i}>✓ {r}</li>
          ))}
          {warnings.slice(0, 2).map((w, i) => (
            <li key={`w-${i}`} className="warning">⚠ {w}</li>
          ))}
        </ul>

        <div className="dest-card-footer">
          <span className="dest-meta">💰 {COST_LABEL[d.costTier]} · US$ {COST_RANGE_USD[d.costTier]}/día</span>
          {d.flightHoursFromEze && (
            <span className="dest-meta">✈️ {d.flightHoursFromEze}h desde EZE</span>
          )}
          <span className="dest-score">{score}</span>
        </div>
      </button>
      <button
        className={`wishlist-btn ${isInWishlist ? "active" : ""}`}
        onClick={() => onToggleWishlist(d.id)}
        aria-label={isInWishlist ? "Quitar de la lista" : "Guardar"}
        title={isInWishlist ? "Quitar de la lista" : "Guardar"}
      >
        {isInWishlist ? "❤️" : "🤍"}
      </button>
      <button
        className="dest-create-btn"
        onClick={() => onCreateTrip(d.id)}
        title={`Crear viaje a ${d.name}`}
      >
        + Crear viaje
      </button>
    </div>
  );
}
