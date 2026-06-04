import type { Trip } from "../types";
import { formatDateRange, daysBetween } from "../lib/format";
import { autoStatus } from "../lib/status";
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
    <div className="trip-card-wrap">
      <button className="trip-card" onClick={() => onOpen(trip.id)}>
        <div className="trip-card-header">
          <span className={`status-pill status-${status}`}>
            {t("tripDetail.status." + status)}
          </span>
          <span className="trip-days">{t("tripCard.days", { n: days })}</span>
        </div>
        <h2 className="trip-card-title">{trip.title}</h2>
        {trip.subtitle && <p className="trip-card-subtitle">{trip.subtitle}</p>}
        <div className="trip-card-meta">
          <div>📅 {formatDateRange(trip.startDate, trip.endDate)}</div>
          <div>📍 {trip.destinations.join(" + ")}</div>
          <div>👥 {trip.travelers === 1 ? t("tripCard.person", { n: trip.travelers }) : t("tripCard.persons", { n: trip.travelers })}</div>
        </div>
        <div className="trip-card-footer">
          <Countdown trip={trip} />
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
