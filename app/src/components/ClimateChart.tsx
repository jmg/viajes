import type { MonthClimate } from "../destinations/types";

const MONTHS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

type Props = {
  climate: MonthClimate[];
  highlightMonth?: number; // 1-12
};

export function ClimateChart({ climate, highlightMonth }: Props) {
  const width = 540;
  const height = 220;
  const padTop = 20;
  const padBottom = 36;
  const padX = 30;

  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const allTemps = climate.flatMap((c) => [c.highC, c.lowC]);
  const minT = Math.floor(Math.min(...allTemps) / 5) * 5 - 5;
  const maxT = Math.ceil(Math.max(...allTemps) / 5) * 5 + 5;
  const maxRain = Math.max(...climate.map((c) => c.rainMm), 50);

  const x = (i: number) => padX + (i + 0.5) * (innerW / 12);
  const yT = (t: number) => padTop + innerH - ((t - minT) / (maxT - minT)) * innerH;

  const highPath = climate.map((c, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yT(c.highC)}`).join(" ");
  const lowPath = climate.map((c, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yT(c.lowC)}`).join(" ");
  const areaPath = `${highPath} L ${x(11)} ${yT(climate[11].lowC)} ${climate.slice().reverse().map((c, i) => `L ${x(11 - i)} ${yT(c.lowC)}`).join(" ")} Z`;

  const rainBarHeight = (r: number) => (r / maxRain) * (innerH * 0.4);
  const rainBaseY = padTop + innerH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="climate-chart" role="img" aria-label="Clima mensual">
      {/* Rain bars */}
      {climate.map((c, i) => {
        const h = rainBarHeight(c.rainMm);
        const w = innerW / 12 - 6;
        return (
          <rect
            key={`r-${i}`}
            x={x(i) - w / 2}
            y={rainBaseY - h}
            width={w}
            height={h}
            className="climate-rain"
            opacity={highlightMonth && highlightMonth - 1 === i ? 0.9 : 0.45}
          />
        );
      })}

      {/* Temperature area */}
      <path d={areaPath} className="climate-temp-area" />
      <path d={highPath} className="climate-temp-high" fill="none" />
      <path d={lowPath} className="climate-temp-low" fill="none" />

      {/* Highlight month */}
      {highlightMonth && (
        <g>
          <line
            x1={x(highlightMonth - 1)}
            x2={x(highlightMonth - 1)}
            y1={padTop}
            y2={rainBaseY}
            className="climate-highlight"
          />
          <circle cx={x(highlightMonth - 1)} cy={yT(climate[highlightMonth - 1].highC)} r={4} className="climate-temp-high-dot" />
          <circle cx={x(highlightMonth - 1)} cy={yT(climate[highlightMonth - 1].lowC)} r={4} className="climate-temp-low-dot" />
        </g>
      )}

      {/* Month labels */}
      {MONTHS.map((m, i) => (
        <text
          key={i}
          x={x(i)}
          y={height - 14}
          className={`climate-month-label ${highlightMonth && highlightMonth - 1 === i ? "highlighted" : ""}`}
        >
          {m}
        </text>
      ))}

      {/* Legend */}
      <g transform={`translate(${padX}, 8)`}>
        <rect width={10} height={10} y={-4} className="climate-temp-high" />
        <text x={16} y={4} className="climate-legend">máx</text>
        <rect width={10} height={10} x={62} y={-4} className="climate-temp-low" />
        <text x={78} y={4} className="climate-legend">mín</text>
        <rect width={10} height={10} x={120} y={-4} className="climate-rain" />
        <text x={136} y={4} className="climate-legend">lluvia</text>
      </g>
    </svg>
  );
}
