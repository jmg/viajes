import type { Trip } from "../types";
import { formatDateRange, daysBetween, formatDate } from "../lib/format";

type Props = {
  trip: Trip;
  onSaveCopy: () => void;
  onDismiss: () => void;
};

export function SharedTripView({ trip, onSaveCopy, onDismiss }: Props) {
  return (
    <div className="shared-view">
      <div className="shared-banner">
        <span>🔗 Estás viendo un viaje compartido (solo lectura)</span>
        <div className="shared-banner-actions">
          <button className="button-primary" onClick={onSaveCopy}>Guardar copia en mis viajes</button>
          <button className="button-secondary" onClick={onDismiss}>Cerrar</button>
        </div>
      </div>

      <header className="trip-header">
        <h1>{trip.title}</h1>
        {trip.subtitle && <p className="subtitle">{trip.subtitle}</p>}
        <div className="trip-meta-row">
          <span>📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
          <span>📍 {trip.destinations.join(" → ")}</span>
          <span>{daysBetween(trip.startDate, trip.endDate)} días</span>
          <span>👥 {trip.travelers}</span>
        </div>
      </header>

      {trip.summary && <p className="summary">{trip.summary}</p>}

      {trip.itinerary?.length ? (
        <section className="dest-section">
          <h3>Itinerario</h3>
          <ol className="itinerary">
            {trip.itinerary.map((d) => (
              <li key={d.dayNumber} className="itinerary-day">
                <div className="day-marker">
                  <span className="day-emoji">{d.emoji ?? "📍"}</span>
                  <span className="day-number">Día {d.dayNumber}</span>
                </div>
                <div className="day-body">
                  <div className="day-date">{formatDate(d.date)} · {d.location}</div>
                  <h3 className="day-title">{d.title}</h3>
                  <ul className="day-highlights">
                    {d.highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                  {d.notes && <p className="day-notes">{d.notes}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {trip.checklist?.length ? (
        <section className="dest-section">
          <h3>Checklist</h3>
          <ul className="shared-list">
            {trip.checklist.map((c, i) => <li key={i}>{c.label}{c.category ? ` · ${c.category}` : ""}</li>)}
          </ul>
        </section>
      ) : null}

      {trip.links?.length ? (
        <section className="dest-section">
          <h3>Links</h3>
          <ul className="shared-list">
            {trip.links.map((l) => (
              <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a></li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
