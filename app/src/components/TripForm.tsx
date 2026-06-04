import { useState } from "react";
import type { Trip } from "../types";
import { TEMPLATES, applyTemplate } from "../lib/templates";
import type { TemplateId } from "../lib/templates";
import { DestinationPicker } from "./DestinationPicker";
import { anyCoastal, findDestination } from "../destinations/match";

type Prefill = {
  destinationName?: string;
  month?: number;
  duration?: number;
};

type Props = {
  trip?: Trip;
  prefill?: Prefill;
  onSave: (trip: Trip) => void;
  onCancel: () => void;
};

const newId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `trip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const computePrefillDates = (month?: number, duration?: number): { start: string; end: string } => {
  if (!month) return { start: "", end: "" };
  const now = new Date();
  let year = now.getFullYear();
  if (month <= now.getMonth() + 1) year += 1; // próxima ocurrencia del mes
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month - 1, Math.min(28, (duration ?? 7)));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
};

/** Título armado solo con los destinos, para no obligar a escribirlo. */
const autoTitle = (dests: string[]): string => {
  const ds = dests.map((d) => d.trim()).filter(Boolean);
  if (ds.length === 0) return "";
  if (ds.length === 1) return `Viaje a ${ds[0]}`;
  if (ds.length === 2) return `${ds[0]} + ${ds[1]}`;
  return `${ds[0]} + ${ds.length - 1} más`;
};

/** Fechas sugeridas a partir del primer destino del catálogo (su mejor mes + duración). */
const suggestDates = (dests: string[]): { start: string; end: string } | null => {
  for (const n of dests) {
    const d = findDestination(n);
    if (d?.bestMonths?.length) return computePrefillDates(d.bestMonths[0], d.suggestedDuration?.min);
  }
  return null;
};

export function TripForm({ trip, prefill, onSave, onCancel }: Props) {
  const isEdit = !!trip;
  const prefillDates = computePrefillDates(prefill?.month, prefill?.duration);

  const [title, setTitle] = useState(trip?.title ?? "");
  const [subtitle, setSubtitle] = useState(trip?.subtitle ?? "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? prefillDates.start);
  const [endDate, setEndDate] = useState(trip?.endDate ?? prefillDates.end);
  const [origin, setOrigin] = useState(trip?.origin ?? "");
  const [destinations, setDestinations] = useState<string[]>(
    trip?.destinations ?? (prefill?.destinationName ? [prefill.destinationName] : []),
  );
  const [travelers, setTravelers] = useState(trip?.travelers ?? 1);
  const [status, setStatus] = useState<Trip["status"]>(trip?.status ?? "planning");
  const [coastal, setCoastal] = useState(trip?.coastal ?? false);
  const [summary, setSummary] = useState(trip?.summary ?? "");
  const [templateId, setTemplateId] = useState<TemplateId>("blank");
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al cambiar destinos: sugerimos fechas (si están vacías) y autodetectamos
  // viaje costero — el usuario no tiene que pensar en esos detalles.
  const handleDestinations = (next: string[]) => {
    setDestinations(next);
    if (!startDate && !endDate) {
      const s = suggestDates(next);
      if (s) { setStartDate(s.start); setEndDate(s.end); }
    }
    if (!coastal && anyCoastal(next)) setCoastal(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const dests = destinations.map((d) => d.trim()).filter(Boolean);
    if (dests.length === 0) return setError("Agregá al menos un destino.");
    if (!startDate || !endDate) return setError("Las fechas de ida y vuelta son obligatorias.");
    if (endDate < startDate) return setError("La fecha de vuelta debe ser posterior a la de ida.");

    const next: Trip = {
      ...trip,
      id: trip?.id ?? newId(),
      title: title.trim() || autoTitle(dests),
      subtitle: subtitle.trim() || undefined,
      startDate,
      endDate,
      origin: origin.trim(),
      destinations: dests,
      travelers,
      status,
      coastal: coastal || undefined,
      summary: summary.trim() || undefined,
    };

    if (!isEdit && templateId !== "blank") {
      const template = TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        const overlay = applyTemplate(template);
        Object.assign(next, overlay);
      }
    }

    onSave(next);
  };

  // En creación, los campos secundarios viven detrás de "Más detalles".
  const showDetails = isEdit || showMore;

  const dayCount = startDate && endDate && endDate >= startDate
    ? Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86_400_000) + 1
    : 0;

  return (
    <form className="trip-form" onSubmit={submit}>
      {!isEdit && (
        <label className="field">
          <span>Empezar desde plantilla <small>(suma checklist según el tipo de viaje)</small></span>
          <div className="template-grid">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`template-chip ${templateId === t.id ? "active" : ""}`}
                onClick={() => {
                  setTemplateId(t.id);
                  if (t.coastal) setCoastal(true);
                }}
              >
                <span className="template-emoji">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </label>
      )}

      <label className="field">
        <span>¿A dónde vas? * <small>(uno o varios — buscá en el catálogo o escribí libre)</small></span>
        <DestinationPicker value={destinations} onChange={handleDestinations} placeholder="Ej: Porto de Galinhas, Maragogi…" />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Fecha de ida *</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="field">
          <span>Fecha de vuelta *</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>
      {dayCount > 0 && <p className="form-hint">📅 {dayCount} {dayCount === 1 ? "día" : "días"} de viaje</p>}

      <label className="field">
        <span>Título <small>(opcional — si lo dejás vacío lo armamos con los destinos)</small></span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={autoTitle(destinations) || "Ej: Brasil — Porto de Galinhas + Maragogi"}
        />
      </label>

      {!isEdit && !showMore && (
        <button type="button" className="link-button more-details-btn" onClick={() => setShowMore(true)}>
          + Más detalles (opcional)
        </button>
      )}

      {showDetails && (
        <>
          <label className="field">
            <span>Subtítulo</span>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ej: 13 días de playa en el nordeste"
            />
          </label>

          <label className="field">
            <span>Origen</span>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Ej: Buenos Aires"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Viajeros</span>
              <input
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </label>
            {isEdit && (
              <label className="field">
                <span>Estado</span>
                <select value={status} onChange={(e) => setStatus(e.target.value as Trip["status"])}>
                  <option value="planning">Planeando</option>
                  <option value="booked">Reservado</option>
                  <option value="past">Pasado</option>
                </select>
              </label>
            )}
          </div>

          <label className="field checkbox">
            <input type="checkbox" checked={coastal} onChange={(e) => setCoastal(e.target.checked)} />
            <span>Viaje costero — calcular fases lunares y mareas automáticamente</span>
          </label>

          <label className="field">
            <span>Descripción</span>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Resumen del viaje, idea general..."
            />
          </label>
        </>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="button-primary">{isEdit ? "Guardar cambios" : "Crear viaje"}</button>
      </div>
    </form>
  );
}
