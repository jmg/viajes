import type { Trip } from "../types";
import { formatDate, daysBetween } from "../lib/format";
import { autoStatus, daysUntilEnd } from "../lib/status";

type Props = { trip: Trip; onGoToItinerary: () => void };

const today = (): string => new Date().toISOString().slice(0, 10);

export function TodayPanel({ trip, onGoToItinerary }: Props) {
  if (autoStatus(trip) !== "in-progress") return null;

  const totalDays = daysBetween(trip.startDate, trip.endDate) + 1;
  const startTime = new Date(trip.startDate + "T00:00:00").getTime();
  const dayNumber = Math.floor((Date.now() - startTime) / 86_400_000) + 1;
  const remaining = daysUntilEnd(trip);

  const todayIso = today();
  const todayDay = trip.itinerary?.find((d) => d.date === todayIso) ?? null;

  return (
    <div className="today-panel">
      <div className="today-header">
        <div>
          <span className="today-badge-inline">HOY</span>
          <strong>Día {dayNumber} de {totalDays}</strong>
          <span className="today-sub"> · {formatDate(todayIso)} · faltan {remaining} {remaining === 1 ? "día" : "días"}</span>
        </div>
        {trip.itinerary?.length ? (
          <button className="link-button" onClick={onGoToItinerary}>Ver itinerario →</button>
        ) : null}
      </div>
      {todayDay ? (
        <div className="today-content">
          <div className="today-emoji">{todayDay.emoji ?? "📍"}</div>
          <div className="today-info">
            <div className="today-location">{todayDay.location}</div>
            <h3 className="today-title">{todayDay.title}</h3>
            <ul className="today-highlights">
              {todayDay.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
            {todayDay.notes && <p className="today-notes">{todayDay.notes}</p>}
          </div>
        </div>
      ) : (
        <p className="today-empty">
          No tenés actividades cargadas para hoy. {trip.itinerary?.length
            ? "Revisá el itinerario o agregá una entrada para esta fecha."
            : "Empezá generando un itinerario o agregando días."}
        </p>
      )}
    </div>
  );
}
