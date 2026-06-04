import { useState } from "react";
import type { ItineraryDay } from "../../types";
import { formatDate } from "../../lib/format";
import { weatherDayIcon } from "../../lib/forecast";
import type { DailyWeather } from "../../lib/forecast";
import type { WeatherLookup } from "../../hooks/useTripWeather";
import { useT } from "../../i18n";

type T = ReturnType<typeof useT>;

type Props = {
  days: ItineraryDay[];
  /** Fechas del viaje — habilitan "Generar días" (un día por fecha del rango). */
  tripStart?: string;
  tripEnd?: string;
  /** Destinos del viaje — se reparten en bloques contiguos al generar los días. */
  destinations?: string[];
  /** Clima por día (fecha + lugar) para mostrarlo embebido en cada día. */
  weatherFor?: WeatherLookup;
  onChange: (days: ItineraryDay[]) => void;
};

const EMOJIS = ["📍", "🛫", "🛬", "🏖", "🌊", "🐢", "🤿", "🏝", "🛶", "🚐", "🌅", "🌕", "🛍", "🍽", "🏛", "🚗", "⛷", "🥾", "🏔", "🗺", "🎒", "🌃", "🌞", "🌙"];

const today = (): string => new Date().toISOString().slice(0, 10);

/** Un ItineraryDay por cada fecha del rango, repartiendo los destinos en bloques contiguos. */
function buildDays(start: string, end: string, destinations: string[], t: T): ItineraryDay[] {
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
      title: location ? t("itinerary.dayInLocation", { location }) : t("itinerary.dayN", { n: i + 1 }),
      highlights: [],
      emoji: "📍",
    };
  });
}

export function ItineraryEditor({ days, tripStart, tripEnd, destinations, weatherFor, onChange }: Props) {
  const t = useT();
  const todayIso = today();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const nextDayNumber = days.length === 0 ? 1 : Math.max(...days.map((d) => d.dayNumber)) + 1;

  const canGenerate = !!tripStart && !!tripEnd;
  const generateDays = () => {
    if (!tripStart || !tripEnd) return;
    if (days.length > 0 && !confirm(t("itinerary.confirmRegenerate"))) return;
    const generated = buildDays(tripStart, tripEnd, destinations ?? [], t);
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
    if (!confirm(t("itinerary.confirmDelete"))) return;
    onChange(days.filter((d) => d.dayNumber !== n));
  };

  return (
    <div className="itinerary-editor">
      <ol className="itinerary">
        {days.map((d) => (
          <li key={d.dayNumber} className={`itinerary-day${d.date === todayIso ? " today" : ""}`}>
            {d.date === todayIso && <span className="today-badge">{t("itinerary.today")}</span>}
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
                  <span className="day-number">{t("itinerary.dayN", { n: d.dayNumber })}</span>
                </div>
                <div className="day-body">
                  <div className="day-date">
                    {formatDate(d.date)}{d.location ? ` · ${d.location}` : ""}
                    <DayWeather weather={weatherFor?.(d.date, d.location)} t={t} />
                  </div>
                  <h3 className="day-title">{d.title}</h3>
                  <ul className="day-highlights">
                    {d.highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                  {d.notes && <p className="day-notes">{d.notes}</p>}
                </div>
                <div className="day-actions">
                  <button className="icon-button small" onClick={() => setEditingId(d.dayNumber)} title={t("itinerary.editDay")}>✎</button>
                  <button className="icon-button small" onClick={() => remove(d.dayNumber)} title={t("itinerary.deleteDay")}>✕</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>

      {days.length === 0 && !adding && (
        <p className="itinerary-empty-hint">
          {t("itinerary.emptyHint")}{canGenerate ? t("itinerary.emptyHintGenerate") : ""}
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
          <button className="button-primary add-day-btn" onClick={() => setAdding(true)}>{t("itinerary.addDay")}</button>
          {canGenerate && (
            <button className="button-secondary" onClick={generateDays}>
              ✨ {days.length === 0 ? t("itinerary.generateDays") : t("itinerary.regenerateDays")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DayWeather({ weather, t }: { weather?: DailyWeather; t: T }) {
  if (!weather) return null;
  const prob = weather.rainyDayProb != null ? Math.round(weather.rainyDayProb * 100) : null;
  const tip = prob != null
    ? t("itinerary.weatherTipRain", { max: weather.tempMax, min: weather.tempMin, prob })
    : t("itinerary.weatherTip", { max: weather.tempMax, min: weather.tempMin });
  return (
    <span className="day-weather" title={tip}>
      <span className="day-weather-icon">{weatherDayIcon(weather)}</span>
      <span className="day-weather-temp">{weather.tempMin}°/{weather.tempMax}°</span>
      {prob != null && prob >= 40 && <span className="day-weather-rain">💧{prob}%</span>}
    </span>
  );
}

function DayForm({ initial, onSave, onCancel }: {
  initial: ItineraryDay;
  onSave: (day: ItineraryDay) => void;
  onCancel: () => void;
}) {
  const t = useT();
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
          <span>{t("itinerary.fieldDay")}</span>
          <input type="number" value={dayNumber} onChange={(e) => setDayNumber(parseInt(e.target.value, 10) || 1)} min={0} />
        </label>
        <label className="field">
          <span>{t("itinerary.fieldDate")}</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <label className="field">
        <span>{t("itinerary.fieldPlace")}</span>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("itinerary.placePlaceholder")} />
      </label>
      <label className="field">
        <span>{t("itinerary.fieldTitle")}</span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("itinerary.titlePlaceholder")} />
      </label>
      <label className="field">
        <span>{t("itinerary.fieldHighlights")} <small>{t("itinerary.highlightsHint")}</small></span>
        <textarea rows={4} value={highlights} onChange={(e) => setHighlights(e.target.value)} />
      </label>
      <label className="field">
        <span>{t("itinerary.fieldNotes")}</span>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <label className="field">
        <span>{t("itinerary.fieldEmoji")}</span>
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
        <button type="button" className="button-secondary" onClick={onCancel}>{t("common.cancel")}</button>
        <button type="button" className="button-primary" onClick={save}>{t("itinerary.saveDay")}</button>
      </div>
    </div>
  );
}
