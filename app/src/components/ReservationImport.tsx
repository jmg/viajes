import { useState } from "react";
import type { Trip } from "../types";
import type { Settings } from "../lib/settings";
import { parseReservation, describeAiError } from "../lib/ai";
import type { ParsedReservation } from "../lib/ai";
import { track } from "../lib/analytics";

type Props = {
  settings: Settings;
  onCreateTrip: (trip: Trip) => void;
  onOpenSettings: () => void;
};

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `trip-${Date.now().toString(36)}`;

export function ReservationImport({ settings, onCreateTrip, onOpenSettings }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedReservation | null>(null);

  const noKey = !settings.anthropicApiKey;

  const parse = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await parseReservation(settings.anthropicApiKey, settings.aiModel, text);
      setResult(r);
      track("reservation_parse", { type: r.type });
    } catch (e) {
      setError(describeAiError(e));
    } finally {
      setLoading(false);
    }
  };

  const createTrip = () => {
    if (!result) return;
    const dest = result.destination || "Destino";
    const start = result.startDate || new Date().toISOString().slice(0, 10);
    const end = result.endDate || start;
    const summary = [
      result.provider ? `Proveedor: ${result.provider}` : "",
      result.confirmationCode ? `Código: ${result.confirmationCode}` : "",
      result.details,
    ].filter(Boolean).join(" · ");

    const trip: Trip = {
      id: newId(),
      title: result.title || `Reserva en ${dest}`,
      startDate: start,
      endDate: end,
      origin: result.origin || settings.originCity,
      destinations: [dest],
      travelers: 1,
      status: "booked",
      summary,
      checklist: result.confirmationCode
        ? [{ label: `${result.type} — código ${result.confirmationCode}`, category: "Reservas" }]
        : undefined,
    };
    track("reservation_create");
    onCreateTrip(trip);
  };

  if (noKey) {
    return (
      <div className="reservation-import">
        <p>Necesitás configurar tu API key de Anthropic para parsear reservas con IA.</p>
        <button className="button-primary" onClick={onOpenSettings}>Ir a Configuración</button>
      </div>
    );
  }

  return (
    <div className="reservation-import">
      <p className="settings-hint">
        Pegá el texto de un mail de confirmación (vuelo, hotel, tour) y la IA extrae los datos
        para crear un viaje automáticamente.
      </p>
      <textarea
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pegá acá el mail de Booking, LATAM, Airbnb, etc."
      />
      {error && <p className="form-error">{error}</p>}

      {result && (
        <div className="reservation-result">
          <h4>Detectado: {result.type}</h4>
          <ul>
            <li><strong>{result.title}</strong></li>
            {result.origin && <li>Origen: {result.origin}</li>}
            {result.destination && <li>Destino: {result.destination}</li>}
            {(result.startDate || result.endDate) && <li>Fechas: {result.startDate} → {result.endDate || result.startDate}</li>}
            {result.provider && <li>Proveedor: {result.provider}</li>}
            {result.confirmationCode && <li>Código: {result.confirmationCode}</li>}
          </ul>
          <p className="settings-hint">{result.details}</p>
        </div>
      )}

      <div className="form-actions">
        {result ? (
          <>
            <button className="button-secondary" onClick={() => setResult(null)} disabled={loading}>Volver a parsear</button>
            <button className="button-primary" onClick={createTrip}>Crear viaje</button>
          </>
        ) : (
          <button className="button-ai" onClick={parse} disabled={loading || !text.trim()}>
            {loading ? "Analizando…" : "✨ Analizar reserva"}
          </button>
        )}
      </div>
    </div>
  );
}
