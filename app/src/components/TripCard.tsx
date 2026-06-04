import type { Trip } from "../types";
import { formatDateRange, daysBetween } from "../lib/format";
import { autoStatus } from "../lib/status";
import { findDestination } from "../destinations/match";
import { Countdown } from "./Countdown";
import { useT } from "../i18n";

type Props = {
  trip: Trip;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TripCard({ trip, onOpen, onEdit, onDelete }: Props) {
  const t = useT();
  const days = daysBetween(trip.startDate, trip.endDate);
  const status = autoStatus(trip);

  return (
    <div className={`trip-card-wrap status-edge-${status}`}>
      <button className="trip-card" onClick={() => onOpen(trip.id)}>
        <div className="trip-card-header">
          <span className={`status-pill status-${status}`}>
            {t("tripDetail.status." + status)}
          </span>
        </div>

        <h2 className="trip-card-title">{trip.title}</h2>
        {trip.subtitle && <p className="trip-card-subtitle">{trip.subtitle}</p>}

        <div className="trip-card-chips">
          {trip.destinations.map((name, i) => {
            const match = findDestination(name);
            return (
              <span key={`${name}-${i}`} className="trip-dest-chip">
                <span>{match?.flag ?? "📍"}</span>{name}
              </span>
            );
          })}
        </div>

        <div className="trip-card-meta">
          <span>📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
          <span className="dot">·</span>
          <span>{t("tripCard.days", { n: days })}</span>
          <span className="dot">·</span>
          <span>👥 {trip.travelers === 1 ? t("tripCard.person", { n: trip.travelers }) : t("tripCard.persons", { n: trip.travelers })}</span>
        </div>

        <div className="trip-card-footer">
          <span className="trip-card-countdown">🗓 <Countdown trip={trip} /></span>
        </div>
      </button>
      <div className="card-actions">
        <button
          className="icon-button"
          onClick={(e) => { e.stopPropagation(); onEdit(trip.id); }}
          title={t("common.edit")}
          aria-label={t("common.edit")}
        >✎</button>
        <button
          className="icon-button"
          onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
          title={t("common.delete")}
          aria-label={t("common.delete")}
        >🗑</button>
      </div>
    </div>
  );
}
