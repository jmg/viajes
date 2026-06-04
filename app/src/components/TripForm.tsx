import { useState } from "react";
import type { Trip } from "../types";
import { TEMPLATES, applyTemplate } from "../lib/templates";
import type { TemplateId } from "../lib/templates";
import { DestinationPicker } from "./DestinationPicker";

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

export function TripForm({ trip, prefill, onSave, onCancel }: Props) {
  const isEdit = !!trip;
  const prefillDates = computePrefillDates(prefill?.month, prefill?.duration);
  const prefillTitle = prefill?.destinationName ? `Viaje a ${prefill.destinationName}` : "";

  const [title, setTitle] = useState(trip?.title ?? prefillTitle);
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
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("El título es obligatorio.");
    if (!startDate || !endDate) return setError("Las fechas de ida y vuelta son obligatorias.");
    if (endDate < startDate) return setError("La fecha de vuelta debe ser posterior a la de ida.");

    const dests = destinations.map((d) => d.trim()).filter(Boolean);
    if (dests.length === 0) return setError("Agregá al menos un destino.");

    const next: Trip = {
      ...trip,
      id: trip?.id ?? newId(),
      title: title.trim(),
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

  return (
    <form className="trip-form" onSubmit={submit}>
      {!isEdit && (
        <label className="field">
          <span>Empezar desde plantilla</span>
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
        <span>Título *</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Brasil — Porto de Galinhas + Maragogi"
          autoFocus
        />
      </label>

      <label className="field">
        <span>Subtítulo</span>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Ej: 13 días de playa en el nordeste"
        />
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

      <label className="field">
        <span>Origen</span>
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Ej: Buenos Aires"
        />
      </label>

      <label className="field">
        <span>Destinos * <small>(uno o varios — buscá en el catálogo o escribí libre)</small></span>
        <DestinationPicker value={destinations} onChange={setDestinations} placeholder="Ej: Porto de Galinhas, Maragogi…" />
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
        <label className="field">
          <span>Estado</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as Trip["status"])}>
            <option value="planning">Planeando</option>
            <option value="booked">Reservado</option>
            <option value="past">Pasado</option>
          </select>
        </label>
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

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="button-primary">{isEdit ? "Guardar cambios" : "Crear viaje"}</button>
      </div>
    </form>
  );
}
