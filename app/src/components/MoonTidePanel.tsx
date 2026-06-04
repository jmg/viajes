import type { MoonPhase, TideWindow } from "../types";
import { formatDate, moonEmoji, moonName } from "../lib/format";
import { useT } from "../i18n";

type Props = {
  phases?: MoonPhase[];
  windows?: TideWindow[];
};

const QUALITY_KEY: Record<TideWindow["quality"], string> = {
  exceptional: "moon.qualityExceptional",
  "very-good": "moon.qualityVeryGood",
  good: "moon.qualityGood",
  regular: "moon.qualityRegular",
};

const TIDE_QUALITY_KEY: Record<MoonPhase["tideQuality"], string> = {
  low: "moon.tideLow",
  medium: "moon.tideMedium",
  high: "moon.tideHigh",
  extreme: "moon.tideExtreme",
};

export function MoonTidePanel({ phases, windows }: Props) {
  const t = useT();
  if (!phases?.length && !windows?.length) return null;

  return (
    <div className="moon-tide-panel">
      {windows && windows.length > 0 && (
        <div className="windows">
          <h3>{t("moon.windowsTitle")}</h3>
          <div className="window-grid">
            {windows.map((w, i) => (
              <div key={i} className={`window-card quality-${w.quality}`}>
                <div className="window-quality">{t(QUALITY_KEY[w.quality])}</div>
                <div className="window-label">{w.label}</div>
                <div className="window-range">{w.range}</div>
                {w.note && <div className="window-note">{w.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {phases && phases.length > 0 && (
        <div className="phases">
          <h3>{t("moon.phasesTitle")}</h3>
          <table className="phases-table">
            <thead>
              <tr>
                <th>{t("moon.thPhase")}</th>
                <th>{t("moon.thDate")}</th>
                <th>{t("moon.thTides")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {phases.map((p, i) => (
                <tr key={i} className={`phase-row tide-${p.tideQuality}`}>
                  <td>{moonEmoji(p.phase)} {moonName(p.phase)}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{t(TIDE_QUALITY_KEY[p.tideQuality])}</td>
                  <td>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
