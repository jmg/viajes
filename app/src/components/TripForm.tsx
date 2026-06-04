import { useState } from "react";
import type { Trip } from "../types";
import { TEMPLATES, applyTemplate } from "../lib/templates";
import type { TemplateId } from "../lib/templates";
import { DestinationPicker } from "./DestinationPicker";
import { anyCoastal, findDestination } from "../destinations/match";
import { useT } from "../i18n";
import { templateLabel } from "../i18n/labels";
import type { t as tFn } from "../i18n/core";

type Prefill = {
  destinationName?: string;
  month?: number;
  duration?: number;
};

type Props = {
  trip?: Trip;
  prefill?: Prefill;
  /** Ciudad de origen por defecto (del aeropuerto configurado en Ajustes). */
  defaultOrigin?: string;
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
const autoTitle = (dests: string[], t: typeof tFn): string => {
  const ds = dests.map((d) => d.trim()).filter(Boolean);
  if (ds.length === 0) return "";
  if (ds.length === 1) return t("tripForm.autoTitleOne", { name: ds[0] });
  if (ds.length === 2) return t("tripForm.autoTitleTwo", { first: ds[0], second: ds[1] });
  return t("tripForm.autoTitleMore", { first: ds[0], n: ds.length - 1 });
};

/** Fechas sugeridas a partir del primer destino del catálogo (su mejor mes + duración). */
const suggestDates = (dests: string[]): { start: string; end: string } | null => {
  for (const n of dests) {
    const d = findDestination(n);
    if (d?.bestMonths?.length) return computePrefillDates(d.bestMonths[0], d.suggestedDuration?.min);
  }
  return null;
};

export function TripForm({ trip, prefill, defaultOrigin, onSave, onCancel }: Props) {
  const t = useT();
  const isEdit = !!trip;
  const prefillDates = computePrefillDates(prefill?.month, prefill?.duration);

  const [title, setTitle] = useState(trip?.title ?? "");
  const [subtitle, setSubtitle] = useState(trip?.subtitle ?? "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? prefillDates.start);
  const [endDate, setEndDate] = useState(trip?.endDate ?? prefillDates.end);
  const [origin, setOrigin] = useState(trip?.origin ?? defaultOrigin ?? "");
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
    if (dests.length === 0) return setError(t("tripForm.errNoDestination"));
    if (!startDate || !endDate) return setError(t("tripForm.errNoDates"));
    if (endDate < startDate) return setError(t("tripForm.errDateOrder"));

    const next: Trip = {
      ...trip,
      id: trip?.id ?? newId(),
      title: title.trim() || autoTitle(dests, t),
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
          <span>{t("tripForm.templateLabel")} <small>{t("tripForm.templateHint")}</small></span>
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
                <span>{templateLabel(t.id)}</span>
              </button>
            ))}
          </div>
        </label>
      )}

      <label className="field">
        <span>{t("tripForm.whereLabel")} <small>{t("tripForm.whereHint")}</small></span>
        <DestinationPicker value={destinations} onChange={handleDestinations} placeholder={t("tripForm.wherePlaceholder")} />
      </label>

      <div className="field-row">
        <label className="field">
          <span>{t("tripForm.departLabel")}</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="field">
          <span>{t("tripForm.returnLabel")}</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>
      {dayCount > 0 && <p className="form-hint">{t("tripForm.dayCount", { n: dayCount, unit: dayCount === 1 ? t("common.day") : t("common.days") })}</p>}

      <label className="field">
        <span>{t("tripForm.titleLabel")} <small>{t("tripForm.titleHint")}</small></span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={autoTitle(destinations, t) || t("tripForm.titlePlaceholder")}
        />
      </label>

      {!isEdit && !showMore && (
        <button type="button" className="link-button more-details-btn" onClick={() => setShowMore(true)}>
          {t("tripForm.moreDetails")}
        </button>
      )}

      {showDetails && (
        <>
          <label className="field">
            <span>{t("tripForm.subtitleLabel")}</span>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder={t("tripForm.subtitlePlaceholder")}
            />
          </label>

          <label className="field">
            <span>{t("tripForm.originLabel")}</span>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder={t("tripForm.originPlaceholder")}
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>{t("tripForm.travelersLabel")}</span>
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
                <span>{t("tripForm.statusLabel")}</span>
                <select value={status} onChange={(e) => setStatus(e.target.value as Trip["status"])}>
                  <option value="planning">{t("tripForm.statusPlanning")}</option>
                  <option value="booked">{t("tripForm.statusBooked")}</option>
                  <option value="past">{t("tripForm.statusPast")}</option>
                </select>
              </label>
            )}
          </div>

          <label className="field checkbox">
            <input type="checkbox" checked={coastal} onChange={(e) => setCoastal(e.target.checked)} />
            <span>{t("tripForm.coastalLabel")}</span>
          </label>

          <label className="field">
            <span>{t("tripForm.descriptionLabel")}</span>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t("tripForm.descriptionPlaceholder")}
            />
          </label>
        </>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>{t("common.cancel")}</button>
        <button type="submit" className="button-primary">{isEdit ? t("common.saveChanges") : t("tripForm.createTrip")}</button>
      </div>
    </form>
  );
}
