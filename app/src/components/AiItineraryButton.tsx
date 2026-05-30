import { useState } from "react";
import type { ItineraryDay, Trip } from "../types";
import type { Settings } from "../lib/settings";
import { generateItinerary, describeAiError } from "../lib/ai";
import { draftItinerary } from "../lib/draftItinerary";
import { track } from "../lib/analytics";

type Props = {
  trip: Trip;
  settings: Settings;
  hasExisting: boolean;
  onApply: (days: ItineraryDay[]) => void;
  onOpenSettings: () => void;
};

export function AiItineraryButton({ trip, settings, hasExisting, onApply, onOpenSettings }: Props) {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noKey = !settings.anthropicApiKey;

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const days = await generateItinerary({
        apiKey: settings.anthropicApiKey,
        model: settings.aiModel,
        trip,
        preferences: preferences.trim() || undefined,
      });
      onApply(days);
      track("ai_itinerary");
      setOpen(false);
      setPreferences("");
    } catch (e) {
      setError(describeAiError(e));
    } finally {
      setLoading(false);
    }
  };

  const draft = () => {
    onApply(draftItinerary(trip));
    track("draft_itinerary");
  };

  if (!open) {
    return (
      <div className="ai-bar">
        <button className="button-ai" onClick={() => setOpen(true)}>
          ✨ Generar itinerario con IA
        </button>
        <button className="button-secondary" onClick={draft} title="Arma un esqueleto editable sin usar IA">
          📝 Borrador rápido (sin IA)
        </button>
      </div>
    );
  }

  return (
    <div className="ai-panel">
      <h4>✨ Generar itinerario con IA</h4>
      {noKey ? (
        <div className="ai-no-key">
          <p>Necesitás configurar tu API key de Anthropic para generar con IA. Mientras tanto, podés armar un borrador sin IA.</p>
          <div className="form-actions">
            <button className="button-secondary" onClick={() => { draft(); setOpen(false); }}>📝 Borrador sin IA</button>
            <button className="button-primary" onClick={onOpenSettings}>Ir a Configuración</button>
          </div>
        </div>
      ) : (
        <>
          <p className="settings-hint">
            La IA va a armar un día por día para <strong>{trip.destinations.join(", ")}</strong> del {trip.startDate} al {trip.endDate}.
            {hasExisting && " Esto reemplaza el itinerario actual."}
          </p>
          <label className="field">
            <span>Preferencias (opcional)</span>
            <textarea
              rows={2}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Ej: comida local, poco caminar, museos, viajamos con un niño..."
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button className="button-secondary" onClick={() => { setOpen(false); setError(null); }} disabled={loading}>
              Cancelar
            </button>
            <button className="button-ai" onClick={run} disabled={loading}>
              {loading ? "Generando…" : "Generar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
