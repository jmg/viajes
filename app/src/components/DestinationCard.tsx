import type { RecommendationResult } from "../destinations/types";
import { CATEGORY_EMOJI, COST_RANGE_USD } from "../destinations/types";
import type { Airport } from "../lib/airports";
import { flightHoursFromOrigin } from "../lib/originFlight";
import { useT } from "../i18n";
import { catLabel, costLabel, ratingLabel, ratingTip } from "../i18n/labels";

type Props = {
  result: RecommendationResult;
  isInWishlist: boolean;
  origin?: Airport | null;
  onOpen: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onCreateTrip: (id: string) => void;
};

export function DestinationCard({ result, isInWishlist, origin, onOpen, onToggleWishlist, onCreateTrip }: Props) {
  const t = useT();
  const { destination: d, climateRating, reasons, warnings, score } = result;
  const flightHours = flightHoursFromOrigin(d, origin ?? null);
  const fromCode = origin?.code ?? "EZE";
  return (
    <div className={`dest-card rating-${climateRating}`}>
      <button className="dest-card-main" onClick={() => onOpen(d.id)}>
        <div className="dest-card-header">
          <span className="dest-flag">{d.flag}</span>
          <div className="dest-name-block">
            <h3>{d.name}</h3>
            <span className="dest-country">{d.country} · {d.region}</span>
          </div>
          <span className={`rating-pill rating-${climateRating}`} title={ratingTip(climateRating)}>{ratingLabel(climateRating)}</span>
        </div>

        <p className="dest-desc">{d.description}</p>

        <div className="dest-categories">
          {d.categories.slice(0, 5).map((c) => (
            <span key={c} className="cat-chip">
              {CATEGORY_EMOJI[c]} {catLabel(c)}
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
          <span className="dest-meta">💰 {costLabel(d.costTier)} · US$ {COST_RANGE_USD[d.costTier]}{t("destCard.perDay")}</span>
          {flightHours !== undefined && (
            <span className="dest-meta">✈️ {t("destCard.flightFrom", { h: flightHours, code: fromCode })}</span>
          )}
          <span className="dest-score">{score}</span>
        </div>
      </button>
      <button
        className={`wishlist-btn ${isInWishlist ? "active" : ""}`}
        onClick={() => onToggleWishlist(d.id)}
        aria-label={isInWishlist ? t("destCard.removeAria") : t("destCard.saveAria")}
        title={isInWishlist ? t("destCard.removeAria") : t("destCard.saveAria")}
      >
        {isInWishlist ? "❤️" : "🤍"}
      </button>
      <button
        className="dest-create-btn"
        onClick={() => onCreateTrip(d.id)}
        title={t("destCard.createTripTitle", { name: d.name })}
      >
        {t("destCard.createTrip")}
      </button>
    </div>
  );
}
