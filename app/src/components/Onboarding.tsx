import type { Settings } from "../lib/settings";

type Props = {
  settings: Settings;
  onNewTrip: () => void;
  onDiscover: () => void;
  onOpenSettings: () => void;
  onImportReservation: () => void;
  onDismiss: () => void;
};

export function Onboarding({ settings, onNewTrip, onDiscover, onOpenSettings, onImportReservation, onDismiss }: Props) {
  const hasAi = !!settings.anthropicApiKey;

  return (
    <div className="onboarding">
      <button className="onboarding-close" onClick={onDismiss} aria-label="Cerrar">✕</button>
      <h2>👋 Bienvenido a Viajes</h2>
      <p className="settings-hint">
        Planeá viajes, descubrí destinos por clima y armá itinerarios con IA.
        Cargamos un viaje de ejemplo (Brasil) para que explores. Empezá por acá:
      </p>

      <div className="onboarding-actions">
        <button className="onboarding-card" onClick={onNewTrip}>
          <span className="onboarding-emoji">✈️</span>
          <strong>Crear un viaje</strong>
          <span>Desde cero o con una plantilla</span>
        </button>
        <button className="onboarding-card" onClick={onDiscover}>
          <span className="onboarding-emoji">🌎</span>
          <strong>Descubrir destinos</strong>
          <span>¿A dónde voy según el clima?</span>
        </button>
        <button className="onboarding-card" onClick={onImportReservation}>
          <span className="onboarding-emoji">📥</span>
          <strong>Importar una reserva</strong>
          <span>Pegá un mail, la IA lo carga</span>
        </button>
      </div>

      <div className="onboarding-setup">
        <h3>Opcional — desbloqueá más funciones</h3>
        <div className="onboarding-status" onClick={onOpenSettings} role="button" tabIndex={0}>
          <span className={`onboarding-dot ${hasAi ? "on" : "off"}`} />
          <div>
            <strong>✨ IA (itinerarios + reservas)</strong>
            <span>{hasAi ? "Configurada" : "Pegá tu API key de Anthropic"}</span>
          </div>
          <span className="onboarding-go">Configurar →</span>
        </div>
      </div>

      <div className="form-actions">
        <button className="button-primary" onClick={onDismiss}>Entendido, empezar</button>
      </div>
    </div>
  );
}
