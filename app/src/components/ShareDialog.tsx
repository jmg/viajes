import { useState } from "react";
import type { Trip } from "../types";
import { buildShareUrl } from "../lib/share";
import { useT } from "../i18n";

type Props = { trip: Trip };

export function ShareDialog({ trip }: Props) {
  const t = useT();
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
      <p className="settings-hint">{t("share.hint")}</p>
      <textarea className="share-url" readOnly value={url} rows={4} onFocus={(e) => e.target.select()} />
      <div className="form-actions">
        <button className="button-primary" onClick={copy}>{copied ? t("share.copied") : t("share.copyLink")}</button>
      </div>
      {tooLong && (
        <p className="form-error">{t("share.tooLong", { kb: Math.round(url.length / 1000) })}</p>
      )}
    </div>
  );
}
