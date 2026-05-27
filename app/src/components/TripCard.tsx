import type { Trip } from "../types";
import { formatDateRange, daysBetween } from "../lib/format";
import { autoStatus, STATUS_LABEL } from "../lib/status";
import { Countdown } from "./Countdown";

type Props = {
  trip: Trip;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TripCard({ trip, onOpen, onEdit, onDelete }: Props) {
  const days = daysBetween(trip.startDate, trip.endDate);
  const status = autoStatus(trip);

  return (
    <div className="trip-card-wrap">
      <button className="trip-card" onClick={() => onOpen(trip.id)}>
        <div className="trip-card-header">
          <span className={`status-pill status-${status}`}>
            {STATUS_LABEL[status]}
          </span>
          <span className="trip-days">{days} días</span>
        </div>
        <h2 className="trip-card-title">{trip.title}</h2>
        {trip.subtitle && <p className="trip-card-subtitle">{trip.subtitle}</p>}
        <div className="trip-card-meta">
          <div>📅 {formatDateRange(trip.startDate, trip.endDate)}</div>
          <div>📍 {trip.destinations.join(" + ")}</div>
          <div>👥 {trip.travelers} {trip.travelers === 1 ? "persona" : "personas"}</div>
        </div>
        <div className="trip-card-footer">
          <Countdown trip={trip} />
        </div>
      </button>
      <div className="card-actions">
        <button
          className="icon-button"
          onClick={(e) => { e.stopPropagation(); onEdit(trip.id); }}
          title="Editar"
          aria-label="Editar"
        >✎</button>
        <button
          className="icon-button"
          onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
          title="Eliminar"
          aria-label="Eliminar"
        >🗑</button>
      </div>
    </div>
  );
}
