import { useState } from "react";
import type { Trip } from "../types";
import { buildShareUrl } from "../lib/share";

type Props = { trip: Trip };

export function ShareDialog({ trip }: Props) {
  const url = buildShareUrl(trip);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const tooLong = url.length > 8000;

  return (
    <div className="share-dialog">
      <p className="settings-hint">
        Este link contiene todo el viaje codificado — cualquiera con el link puede ver una copia de solo lectura.
        No necesita servidor ni cuenta. Para editarlo, el destinatario puede guardar su propia copia.
      </p>
      <textarea className="share-url" readOnly value={url} rows={4} onFocus={(e) => e.target.select()} />
      <div className="form-actions">
        <button className="button-primary" onClick={copy}>{copied ? "✓ Copiado" : "Copiar link"}</button>
      </div>
      {tooLong && (
        <p className="form-error">
          Ojo: el viaje es grande ({Math.round(url.length / 1000)} KB) y el link puede no funcionar en todos lados.
          Para viajes muy grandes conviene usar Export/Import (JSON).
        </p>
      )}
    </div>
  );
}
