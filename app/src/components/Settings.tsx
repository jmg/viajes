import { useState } from "react";
import type { Settings as SettingsType, AiModel } from "../lib/settings";
import { AI_MODEL_LABEL } from "../lib/settings";
import { getStats, clearStats, EVENT_LABEL } from "../lib/analytics";

type Props = {
  settings: SettingsType;
  onSave: (s: SettingsType) => void;
  onClose: () => void;
};

export function Settings({ settings, onSave, onClose }: Props) {
  const [apiKey, setApiKey] = useState(settings.anthropicApiKey);
  const [model, setModel] = useState<AiModel>(settings.aiModel);
  const [origin, setOrigin] = useState(settings.originCity);
  const [show, setShow] = useState(false);
  const [skyscannerAffiliate, setSkyscannerAffiliate] = useState(settings.skyscannerAffiliate);
  const [bookingAffiliate, setBookingAffiliate] = useState(settings.bookingAffiliate);
  const [analyticsEndpoint, setAnalyticsEndpoint] = useState(settings.analyticsEndpoint);
  const [stats, setStats] = useState(() => getStats());
  const [showStats, setShowStats] = useState(false);

  const sortedStats = Object.entries(stats.counts).sort((a, b) => b[1] - a[1]);

  const save = () => {
    onSave({
      anthropicApiKey: apiKey.trim(),
      aiModel: model,
      originCity: origin.trim(),
      skyscannerAffiliate: skyscannerAffiliate.trim(),
      bookingAffiliate: bookingAffiliate.trim(),
      analyticsEndpoint: analyticsEndpoint.trim(),
    });
    onClose();
  };

  return (
    <div className="settings-form">
      <label className="field">
        <span>Ciudad de origen</span>
        <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Ej: Buenos Aires" />
      </label>

      <div className="settings-section">
        <h3>✨ Generación con IA</h3>
        <p className="settings-hint">
          Para generar itinerarios con IA, pegá tu propia API key de Anthropic. Se guarda solo en este navegador
          (localStorage) y se usa directo contra la API de Anthropic. No se envía a ningún otro servidor.
        </p>

        <label className="field">
          <span>API key de Anthropic</span>
          <div className="key-input">
            <input
              type={show ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              autoComplete="off"
            />
            <button type="button" className="button-secondary" onClick={() => setShow((s) => !s)}>
              {show ? "Ocultar" : "Ver"}
            </button>
          </div>
          <small className="settings-hint">
            Conseguí una en console.anthropic.com → API Keys.
          </small>
        </label>

        <label className="field">
          <span>Modelo</span>
          <select value={model} onChange={(e) => setModel(e.target.value as AiModel)}>
            {(Object.keys(AI_MODEL_LABEL) as AiModel[]).map((m) => (
              <option key={m} value={m}>{AI_MODEL_LABEL[m]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="settings-section">
        <h3>💰 Afiliados (opcional)</h3>
        <p className="settings-hint">
          Si tenés IDs de afiliado, los deep links de reserva los incluyen para generar comisiones.
        </p>
        <label className="field">
          <span>Booking.com — affiliate ID (aid)</span>
          <input type="text" value={bookingAffiliate} onChange={(e) => setBookingAffiliate(e.target.value)} placeholder="1234567" />
        </label>
        <label className="field">
          <span>Skyscanner — associate ID</span>
          <input type="text" value={skyscannerAffiliate} onChange={(e) => setSkyscannerAffiliate(e.target.value)} placeholder="abc123" />
        </label>
      </div>

      <div className="settings-section">
        <h3>📊 Analytics de uso</h3>
        <p className="settings-hint">
          Los eventos de uso se cuentan localmente (privado). Si ponés un endpoint, también
          se reenvían ahí (POST JSON) para agregación real entre usuarios.
        </p>
        <label className="field">
          <span>Endpoint de analytics (opcional)</span>
          <input type="text" value={analyticsEndpoint} onChange={(e) => setAnalyticsEndpoint(e.target.value)} placeholder="https://tu-endpoint/track" />
        </label>
        <button type="button" className="link-button" onClick={() => setShowStats((v) => !v)}>
          {showStats ? "Ocultar" : "Ver"} uso local
        </button>
        {showStats && (
          sortedStats.length ? (
            <table className="budget-table">
              <tbody>
                {sortedStats.map(([ev, n]) => (
                  <tr key={ev}><td>{EVENT_LABEL[ev] ?? ev}</td><td className="num">{n}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="settings-hint">Todavía no hay eventos registrados.</p>
        )}
        {showStats && sortedStats.length > 0 && (
          <button type="button" className="button-secondary" onClick={() => { clearStats(); setStats(getStats()); }}>
            Borrar datos de uso
          </button>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onClose}>Cancelar</button>
        <button type="button" className="button-primary" onClick={save}>Guardar</button>
      </div>
    </div>
  );
}
