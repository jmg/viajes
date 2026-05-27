import type { Trip } from "../types";
import { formatDateRange, daysBetween } from "../lib/format";

type Props = {
  trip: Trip;
  onOpen: (id: string) => void;
};

const STATUS_LABEL: Record<Trip["status"], string> = {
  planning: "Planeando",
  booked: "Reservado",
  past: "Pasado",
};

export function TripCard({ trip, onOpen }: Props) {
  const days = daysBetween(trip.startDate, trip.endDate);
  return (
    <button className="trip-card" onClick={() => onOpen(trip.id)}>
      <div className="trip-card-header">
        <span className={`status-pill status-${trip.status}`}>
          {STATUS_LABEL[trip.status]}
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
    </button>
  );
}
