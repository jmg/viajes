import type { ItineraryDay } from "../types";
import { formatDate } from "../lib/format";

type Props = { days: ItineraryDay[] };

export function Itinerary({ days }: Props) {
  return (
    <ol className="itinerary">
      {days.map((d) => (
        <li key={d.dayNumber} className="itinerary-day">
          <div className="day-marker">
            <span className="day-emoji">{d.emoji ?? "📍"}</span>
            <span className="day-number">Día {d.dayNumber}</span>
          </div>
          <div className="day-body">
            <div className="day-date">{formatDate(d.date)} · {d.location}</div>
            <h3 className="day-title">{d.title}</h3>
            <ul className="day-highlights">
              {d.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
            {d.notes && <p className="day-notes">{d.notes}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
