import { useState } from "react";
import type { ItineraryDay } from "../../types";
import { formatDate } from "../../lib/format";

type Props = {
  days: ItineraryDay[];
  /** Fechas del viaje — habilitan "Generar días" (un día por fecha del rango). */
  tripStart?: string;
  tripEnd?: string;
  /** Destinos del viaje — se reparten en bloques contiguos al generar los días. */
  destinations?: string[];
  onChange: (days: ItineraryDay[]) => void;
};

const EMOJIS = ["📍", "🛫", "🛬", "🏖", "🌊", "🐢", "🤿", "🏝", "🛶", "🚐", "🌅", "🌕", "🛍", "🍽", "🏛", "🚗", "⛷", "🥾", "🏔", "🗺", "🎒", "🌃", "🌞", "🌙"];

const today = (): string => new Date().toISOString().slice(0, 10);

/** Un ItineraryDay por cada fecha del rango, repartiendo los destinos en bloques contiguos. */
function buildDays(start: string, end: string, destinations: string[]): ItineraryDay[] {
  const startMs = new Date(start + "T00:00:00Z").getTime();
  const endMs = new Date(end + "T00:00:00Z").getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) return [];
  const dates: string[] = [];
  for (let t = startMs; t <= endMs; t += 86_400_000) dates.push(new Date(t).toISOString().slice(0, 10));
  const dests = destinations.map((d) => d.trim()).filter(Boolean);
  return dates.map((date, i) => {
    const location = dests.length ? dests[Math.min(dests.length - 1, Math.floor((i / dates.length) * dests.length))] : "";
    return {
      dayNumber: i + 1,
      date,
      location,
      title: location ? `Día en ${location}` : `Día ${i + 1}`,
      highlights: [],
      emoji: "📍",
    };
  });
}

export function ItineraryEditor({ days, tripStart, tripEnd, destinations, onChange }: Props) {
  const todayIso = today();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const nextDayNumber = days.length === 0 ? 1 : Math.max(...days.map((d) => d.dayNumber)) + 1;

  const canGenerate = !!tripStart && !!tripEnd;
  const generateDays = () => {
    if (!tripStart || !tripEnd) return;
    if (days.length > 0 && !confirm("Esto reemplaza los días actuales por un día por cada fecha del viaje. ¿Seguir?")) return;
    const generated = buildDays(tripStart, tripEnd, destinations ?? []);
    if (generated.length === 0) return;
    onChange(generated);
    setAdding(false);
    setEditingId(null);
  };

  const upsert = (day: ItineraryDay) => {
    const idx = days.findIndex((d) => d.dayNumber === day.dayNumber);
    if (idx >= 0) {
      const next = days.slice();
      next[idx] = day;
      onChange(next);
    } else {
      onChange([...days, day].sort((a, b) => a.dayNumber - b.dayNumber));
    }
    setAdding(false);
    setEditingId(null);
  };

  const remove = (n: number) => {
    if (!confirm("¿Eliminar este día?")) return;
    onChange(days.filter((d) => d.dayNumber !== n));
  };

  return (
    <div className="itinerary-editor">
      <ol className="itinerary">
        {days.map((d) => (
          <li key={d.dayNumber} className={`itinerary-day${d.date === todayIso ? " today" : ""}`}>
            {d.date === todayIso && <span className="today-badge">HOY</span>}
            {editingId === d.dayNumber ? (
              <DayForm
                initial={d}
                onSave={upsert}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
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
                <div className="day-actions">
                  <button className="icon-button small" onClick={() => setEditingId(d.dayNumber)} title="Editar">✎</button>
                  <button className="icon-button small" onClick={() => remove(d.dayNumber)} title="Eliminar">✕</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>

      {days.length === 0 && !adding && (
        <p className="itinerary-empty-hint">
          Todavía no hay días.{canGenerate ? " Generá uno por cada fecha del viaje y después editá cada uno." : ""}
        </p>
      )}

      {adding ? (
        <div className="day-form-wrap">
          <DayForm
            initial={{ dayNumber: nextDayNumber, date: "", location: "", title: "", highlights: [], emoji: "📍" }}
            onSave={upsert}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <div className="itinerary-actions">
          <button className="button-primary add-day-btn" onClick={() => setAdding(true)}>+ Agregar día</button>
          {canGenerate && (
            <button className="button-secondary" onClick={generateDays}>
              ✨ {days.length === 0 ? "Generar días del viaje" : "Regenerar días"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DayForm({ initial, onSave, onCancel }: {
  initial: ItineraryDay;
  onSave: (day: ItineraryDay) => void;
  onCancel: () => void;
}) {
  const [dayNumber, setDayNumber] = useState(initial.dayNumber);
  const [date, setDate] = useState(initial.date);
  const [location, setLocation] = useState(initial.location);
  const [title, setTitle] = useState(initial.title);
  const [highlights, setHighlights] = useState(initial.highlights.join("\n"));
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [emoji, setEmoji] = useState(initial.emoji ?? "📍");

  const save = () => {
    if (!date || !title.trim()) return;
    onSave({
      dayNumber,
      date,
      location: location.trim(),
      title: title.trim(),
      highlights: highlights.split("\n").map((l) => l.trim()).filter(Boolean),
      notes: notes.trim() || undefined,
      emoji,
    });
  };

  return (
    <div className="day-form">
      <div className="field-row">
        <label className="field">
          <span>Día</span>
          <input type="number" value={dayNumber} onChange={(e) => setDayNumber(parseInt(e.target.value, 10) || 1)} min={0} />
        </label>
        <label className="field">
          <span>Fecha</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <label className="field">
        <span>Lugar</span>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Maragogi" />
      </label>
      <label className="field">
        <span>Título</span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Tour Galés" />
      </label>
      <label className="field">
        <span>Highlights <small>(uno por línea)</small></span>
        <textarea rows={4} value={highlights} onChange={(e) => setHighlights(e.target.value)} />
      </label>
      <label className="field">
        <span>Notas</span>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <label className="field">
        <span>Emoji</span>
        <div className="emoji-picker">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className={`emoji-chip ${emoji === e ? "active" : ""}`}
              onClick={() => setEmoji(e)}
            >{e}</button>
          ))}
        </div>
      </label>
      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>Cancelar</button>
        <button type="button" className="button-primary" onClick={save}>Guardar día</button>
      </div>
    </div>
  );
}
