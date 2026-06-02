import type { MonthClimate } from "../destinations/types";

const MONTHS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

type Props = {
  climate: MonthClimate[];
  highlightMonth?: number; // 1-12
};

type Pt = readonly [number, number];

/** Catmull-Rom → cubic Bézier: curva suave que pasa por todos los puntos. */
function smooth(pts: Pt[], close = false): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0][0]} ${pts[0][1]}` : "";
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return close ? d + " Z" : d;
}

/** Barra con la punta superior redondeada (las bases quedan rectas sobre el eje). */
function bar(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0.5) return "";
  const rr = Math.min(r, w / 2, h);
  return `M ${x} ${y + h} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h} Z`;
}

export function ClimateChart({ climate, highlightMonth }: Props) {
  const width = 560;
  const height = 240;
  const padTop = 24;
  const padBottom = 38;
  const padLeft = 34;
  const padRight = 34;

  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const allTemps = climate.flatMap((c) => [c.highC, c.lowC]);
  const minT = Math.floor(Math.min(...allTemps) / 5) * 5 - 2;
  const maxT = Math.ceil(Math.max(...allTemps) / 5) * 5 + 2;
  const maxRain = Math.max(...climate.map((c) => c.rainMm), 50);

  const rainZoneH = innerH * 0.42; // las barras de lluvia viven en el tercio inferior
  const baseY = padTop + innerH;

  const x = (i: number) => padLeft + (i + 0.5) * (innerW / 12);
  const yT = (t: number) => padTop + innerH - ((t - minT) / (maxT - minT)) * innerH;
  const rainH = (r: number) => (r / maxRain) * rainZoneH;

  const highPts: Pt[] = climate.map((c, i) => [x(i), yT(c.highC)]);
  const lowPts: Pt[] = climate.map((c, i) => [x(i), yT(c.lowC)]);

  const highPath = smooth(highPts);
  const lowPath = smooth(lowPts);
  // Área entre máx y mín: máx hacia adelante + mín en reversa (sin la "M" inicial).
  const lowRevPath = smooth([...lowPts].reverse()).replace(/^M/, "L");
  const areaPath = `${highPath} ${lowRevPath} Z`;

  // Ticks de temperatura, redondeados a múltiplos de 10°.
  const tempTicks: number[] = [];
  for (let t = Math.ceil(minT / 10) * 10; t <= maxT; t += 10) tempTicks.push(t);

  const hi = highlightMonth ? highlightMonth - 1 : -1;
  const barW = innerW / 12 - 8;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="climate-chart" role="img" aria-label="Clima mensual">
      <defs>
        <linearGradient id="cc-rain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="cc-rain-hi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="1" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="cc-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {/* Gridlines + ticks de temperatura */}
      {tempTicks.map((t) => (
        <g key={`t-${t}`}>
          <line x1={padLeft} x2={width - padRight} y1={yT(t)} y2={yT(t)} className="climate-grid" />
          <text x={padLeft - 6} y={yT(t) + 3} className="climate-axis-y">{t}°</text>
        </g>
      ))}

      {/* Banda del mes resaltado (detrás de todo el contenido) */}
      {hi >= 0 && (
        <rect
          x={x(hi) - innerW / 24}
          y={padTop}
          width={innerW / 12}
          height={innerH}
          className="climate-highlight-band"
        />
      )}

      {/* Barras de lluvia */}
      {climate.map((c, i) => {
        const h = rainH(c.rainMm);
        return (
          <path
            key={`r-${i}`}
            d={bar(x(i) - barW / 2, baseY - h, barW, h, 3)}
            fill={i === hi ? "url(#cc-rain-hi)" : "url(#cc-rain)"}
          />
        );
      })}

      {/* Eje base */}
      <line x1={padLeft} x2={width - padRight} y1={baseY} y2={baseY} className="climate-axis-base" />

      {/* Área + líneas de temperatura */}
      <path d={areaPath} fill="url(#cc-area)" stroke="none" />
      <path d={highPath} className="climate-temp-high" fill="none" />
      <path d={lowPath} className="climate-temp-low" fill="none" />

      {/* Puntos del mes resaltado */}
      {hi >= 0 && (
        <g>
          <circle cx={x(hi)} cy={yT(climate[hi].highC)} r={4.5} className="climate-temp-high-dot" />
          <circle cx={x(hi)} cy={yT(climate[hi].lowC)} r={4.5} className="climate-temp-low-dot" />
          <text x={x(hi)} y={yT(climate[hi].highC) - 9} className="climate-point-label hi">{climate[hi].highC}°</text>
          <text x={x(hi)} y={yT(climate[hi].lowC) + 16} className="climate-point-label lo">{climate[hi].lowC}°</text>
        </g>
      )}

      {/* Etiquetas de mes */}
      {MONTHS.map((m, i) => (
        <text
          key={i}
          x={x(i)}
          y={height - 14}
          className={`climate-month-label ${i === hi ? "highlighted" : ""}`}
        >
          {m}
        </text>
      ))}

      {/* Leyenda */}
      <g transform={`translate(${padLeft}, 10)`} className="climate-legend-g">
        <line x1={0} x2={16} y1={0} y2={0} className="climate-temp-high" />
        <text x={20} y={4} className="climate-legend">máx</text>
        <line x1={56} x2={72} y1={0} y2={0} className="climate-temp-low" />
        <text x={76} y={4} className="climate-legend">mín</text>
        <rect x={112} y={-5} width={11} height={10} rx={2} fill="url(#cc-rain)" />
        <text x={128} y={4} className="climate-legend">lluvia</text>
      </g>
    </svg>
  );
}
