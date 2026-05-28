import { useState } from "react";
import type { Settings as SettingsType, AiModel } from "../lib/settings";
import { AI_MODEL_LABEL } from "../lib/settings";

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

  const save = () => {
    onSave({ anthropicApiKey: apiKey.trim(), aiModel: model, originCity: origin.trim() });
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

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onClose}>Cancelar</button>
        <button type="button" className="button-primary" onClick={save}>Guardar</button>
      </div>
    </div>
  );
}
