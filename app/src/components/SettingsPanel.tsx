import { useState } from "react";
import { useLang, useT, LANGS } from "../i18n";
import { airportsByCountry, findAirport, flagEmoji } from "../lib/airports";
import type { Airport } from "../lib/airports";
import { nearestAirport } from "../lib/geo";

type Props = {
  origin: Airport | null;
  onOriginChange: (origin: Airport | null) => void;
};

export function SettingsPanel({ origin, onOriginChange }: Props) {
  const t = useT();
  const { lang, setLang } = useLang();
  const groups = airportsByCountry();

  const [country, setCountry] = useState<string>(origin?.country ?? "");
  const [geoStatus, setGeoStatus] = useState<"idle" | "detecting" | "denied" | "unsupported">("idle");
  const [detectedMsg, setDetectedMsg] = useState<string | null>(null);

  const countryAirports = groups.find((g) => g.country === country)?.airports ?? [];

  const pickAirport = (code: string) => {
    const a = findAirport(code);
    if (a) onOriginChange(a);
  };

  const detect = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("detecting");
    setDetectedMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const a = nearestAirport(pos.coords.latitude, pos.coords.longitude);
        setCountry(a.country);
        onOriginChange(a);
        setGeoStatus("idle");
        setDetectedMsg(t("settings.geoDetected", { airport: `${a.city} (${a.code})` }));
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
    );
  };

  return (
    <div className="settings-panel">
      {/* Idioma */}
      <section className="settings-section">
        <h3>{t("settings.langTitle")}</h3>
        <p className="settings-hint">{t("settings.langHint")}</p>
        <div className="lang-grid">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`lang-chip ${lang === l.code ? "active" : ""}`}
              onClick={() => setLang(l.code)}
            >
              <span className="lang-flag">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Origen */}
      <section className="settings-section">
        <h3>{t("settings.originTitle")}</h3>
        <p className="settings-hint">{t("settings.originHint")}</p>

        <div className="field-row">
          <label className="field">
            <span>{t("settings.country")}</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">{t("settings.selectCountry")}</option>
              {groups.map((g) => (
                <option key={g.country} value={g.country}>{g.country}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("settings.airport")}</span>
            <select
              value={origin?.country === country ? origin?.code : ""}
              onChange={(e) => pickAirport(e.target.value)}
              disabled={!country}
            >
              <option value="">—</option>
              {countryAirports.map((a) => (
                <option key={a.code} value={a.code}>{a.city} · {a.name} ({a.code})</option>
              ))}
            </select>
          </label>
        </div>

        <div className="settings-origin-actions">
          <button type="button" className="button-secondary" onClick={detect} disabled={geoStatus === "detecting"}>
            {geoStatus === "detecting" ? t("settings.detecting") : t("settings.detect")}
          </button>
          {origin && (
            <button type="button" className="link-button" onClick={() => { onOriginChange(null); setCountry(""); }}>
              {t("settings.clearOrigin")}
            </button>
          )}
        </div>
        <p className="settings-hint">{t("settings.detectHint")}</p>

        {geoStatus === "unsupported" && <p className="form-error">{t("settings.geoUnsupported")}</p>}
        {geoStatus === "denied" && <p className="form-error">{t("settings.geoDenied")}</p>}
        {detectedMsg && <p className="form-info">{detectedMsg}</p>}

        <p className="settings-current">
          <strong>{t("settings.current")}:</strong>{" "}
          {origin
            ? `${flagEmoji(origin.countryCode)} ${origin.city} · ${origin.name} (${origin.code}), ${origin.country}`
            : t("settings.notSet")}
        </p>
      </section>
    </div>
  );
}
