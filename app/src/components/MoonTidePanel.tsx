import type { MoonPhase, TideWindow } from "../types";
import { formatDate, moonEmoji, moonName } from "../lib/format";

type Props = {
  phases?: MoonPhase[];
  windows?: TideWindow[];
};

const QUALITY_LABEL: Record<TideWindow["quality"], string> = {
  exceptional: "⭐⭐ Excepcional",
  "very-good": "⭐ Muy buena",
  good: "✅ Buena",
  regular: "⚠ Regular",
};

export function MoonTidePanel({ phases, windows }: Props) {
  if (!phases?.length && !windows?.length) return null;

  return (
    <div className="moon-tide-panel">
      {windows && windows.length > 0 && (
        <div className="windows">
          <h3>Ventanas de mareas favorables</h3>
          <div className="window-grid">
            {windows.map((w, i) => (
              <div key={i} className={`window-card quality-${w.quality}`}>
                <div className="window-quality">{QUALITY_LABEL[w.quality]}</div>
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
          <h3>Fases lunares clave</h3>
          <table className="phases-table">
            <thead>
              <tr>
                <th>Fase</th>
                <th>Fecha</th>
                <th>Mareas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {phases.map((p, i) => (
                <tr key={i} className={`phase-row tide-${p.tideQuality}`}>
                  <td>{moonEmoji(p.phase)} {moonName(p.phase)}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{p.tideQuality}</td>
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
