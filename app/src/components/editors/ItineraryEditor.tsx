import { useState } from "react";
import type { ItineraryDay } from "../../types";
import { formatDate } from "../../lib/format";

type Props = {
  days: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
};

const EMOJIS = ["📍", "🛫", "🛬", "🏖", "🌊", "🐢", "🤿", "🏝", "🛶", "🚐", "🌅", "🌕", "🛍", "🍽", "🏛", "🚗", "⛷", "🥾", "🏔", "🗺", "🎒", "🌃", "🌞", "🌙"];

export function ItineraryEditor({ days, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const nextDayNumber = days.length === 0 ? 1 : Math.max(...days.map((d) => d.dayNumber)) + 1;

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
          <li key={d.dayNumber} className="itinerary-day">
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

      {adding ? (
        <div className="day-form-wrap">
          <DayForm
            initial={{ dayNumber: nextDayNumber, date: "", location: "", title: "", highlights: [], emoji: "📍" }}
            onSave={upsert}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button className="button-primary add-day-btn" onClick={() => setAdding(true)}>+ Agregar día</button>
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
