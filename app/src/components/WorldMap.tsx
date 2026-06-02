import { useRef, useState } from "react";
import type { ClimateRating, Destination, RecommendationResult } from "../destinations/types";
import { CONTINENTS } from "./world-map-paths";

type Props = {
  results: RecommendationResult[];
  onOpen: (id: string) => void;
  onCreateTrip: (id: string) => void;
};

const VB_W = 1000;
const VB_H = 500;
const MIN_SCALE = 1;     // viewBox full = 1×
const MAX_SCALE = 8;     // viewBox 1/8 = 8× zoom
const CLUSTER_GRID_PX = 36;

function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * VB_W,
    y: ((90 - lat) / 180) * VB_H,
  };
}

const COLOR: Record<ClimateRating, string> = {
  ideal: "#34d399",
  good: "#38bdf8",
  ok: "#fbbf24",
  avoid: "#f87171",
};

function pathFromPolygon(points: [number, number][]): string {
  return points.map(([lat, lng], i) => {
    const { x, y } = project(lat, lng);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

type Pin = { id: string; lat: number; lng: number; d: Destination; r: RecommendationResult };
type Cluster = { x: number; y: number; pins: Pin[]; dominantRating: ClimateRating };

const RATING_ORDER: ClimateRating[] = ["ideal", "good", "ok", "avoid"];

export function WorldMap({ results, onOpen, onCreateTrip }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<{ id: string; label: string; x: number; y: number } | null>(null);
  const pins: Pin[] = [];
  for (const r of results) {
    const { lat, lng } = r.destination;
    if (typeof lat === "number" && typeof lng === "number") {
      pins.push({ id: r.destination.id, lat, lng, d: r.destination, r });
    }
  }
  const missing = results.length - pins.length;

  // viewBox state (zoom + pan)
  const [vb, setVb] = useState({ x: 0, y: 0, w: VB_W, h: VB_H });
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x0: number; y0: number; vbX: number; vbY: number } | null>(null);

  const scale = VB_W / vb.w; // 1 = full, >1 = zoomed in

  // Cluster pins by screen-space grid. Cell size in viewBox units depends on scale.
  const cellVb = CLUSTER_GRID_PX / scale;
  const cellsMap = new Map<string, Pin[]>();
  for (const p of pins) {
    const { x, y } = project(p.lat, p.lng);
    if (x < vb.x || x > vb.x + vb.w || y < vb.y || y > vb.y + vb.h) continue;
    const cx = Math.floor(x / cellVb);
    const cy = Math.floor(y / cellVb);
    const key = `${cx},${cy}`;
    const arr = cellsMap.get(key) ?? [];
    arr.push(p);
    cellsMap.set(key, arr);
  }
  const clusters: Cluster[] = [];
  for (const arr of cellsMap.values()) {
    const x = arr.reduce((s, p) => s + project(p.lat, p.lng).x, 0) / arr.length;
    const y = arr.reduce((s, p) => s + project(p.lat, p.lng).y, 0) / arr.length;
    const dominantRating = arr.reduce<ClimateRating>((best, p) => {
      return RATING_ORDER.indexOf(p.r.climateRating) < RATING_ORDER.indexOf(best) ? p.r.climateRating : best;
    }, "avoid");
    clusters.push({ x, y, pins: arr, dominantRating });
  }

  const pinRadius = Math.max(3, 5 / scale);
  const strokeW = Math.max(0.5, 1 / scale);

  // Convert client pixel to viewBox coordinates
  function clientToVb(clientX: number, clientY: number) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const px = ((clientX - rect.left) / rect.width) * vb.w + vb.x;
    const py = ((clientY - rect.top) / rect.height) * vb.h + vb.y;
    return { x: px, y: py };
  }

  function onWheel(e: React.WheelEvent<SVGSVGElement>) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1 / 1.2 : 1.2;
    const newW = clamp(vb.w * factor, VB_W / MAX_SCALE, VB_W / MIN_SCALE);
    const newH = newW * (VB_H / VB_W);
    const mouse = clientToVb(e.clientX, e.clientY);
    const newX = mouse.x - ((mouse.x - vb.x) * newW) / vb.w;
    const newY = mouse.y - ((mouse.y - vb.y) * newH) / vb.h;
    setVb(clampVb({ x: newX, y: newY, w: newW, h: newH }));
  }

  function onMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    drag.current = { x0: e.clientX, y0: e.clientY, vbX: vb.x, vbY: vb.y };
  }
  function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!drag.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - drag.current.x0) / rect.width) * vb.w;
    const dy = ((e.clientY - drag.current.y0) / rect.height) * vb.h;
    setVb((v) => clampVb({ ...v, x: drag.current!.vbX - dx, y: drag.current!.vbY - dy }));
  }
  function onMouseUp() { drag.current = null; }

  function zoomBtn(factor: number) {
    const newW = clamp(vb.w * factor, VB_W / MAX_SCALE, VB_W / MIN_SCALE);
    const newH = newW * (VB_H / VB_W);
    const cx = vb.x + vb.w / 2;
    const cy = vb.y + vb.h / 2;
    setVb(clampVb({ x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH }));
  }
  function resetView() {
    setVb({ x: 0, y: 0, w: VB_W, h: VB_H });
  }

  return (
    <div className="world-map-wrap" ref={wrapRef}>
      <div className="map-controls">
        <button className="icon-button small" onClick={() => zoomBtn(1 / 1.5)} title="Zoom +">＋</button>
        <button className="icon-button small" onClick={() => zoomBtn(1.5)} title="Zoom −">−</button>
        <button className="icon-button small" onClick={resetView} title="Reset">⟲</button>
      </div>
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className="world-map"
        role="img"
        aria-label="Mapa de destinos"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <rect x="0" y="0" width={VB_W} height={VB_H} fill="#0a1120" onClick={() => setSel(null)} />

        {/* Continents */}
        <g className="map-land">
          {CONTINENTS.map((poly, i) => (
            <path key={i} d={pathFromPolygon(poly)} fill="#172238" stroke="#2c3a58" strokeWidth={strokeW} />
          ))}
        </g>

        {/* Grid: ecuador, trópicos y meridiano */}
        <g className="map-grid" strokeWidth={strokeW}>
          <line x1="0" y1="250" x2={VB_W} y2="250" />
          <line x1="0" y1="186.7" x2={VB_W} y2="186.7" strokeDasharray="3 4" />
          <line x1="0" y1="313.3" x2={VB_W} y2="313.3" strokeDasharray="3 4" />
          <line x1="500" y1="0" x2="500" y2={VB_H} />
        </g>

        {/* Pins / clusters */}
        {clusters.map((c, i) => {
          if (c.pins.length === 1) {
            const p = c.pins[0];
            return (
              <g
                key={p.id}
                className="map-pin"
                onClick={(e) => {
                  e.stopPropagation();
                  const r = wrapRef.current?.getBoundingClientRect();
                  if (!r) return onOpen(p.id);
                  setSel({ id: p.id, label: `${p.d.flag} ${p.d.name}`, x: e.clientX - r.left, y: e.clientY - r.top });
                }}
              >
                <circle cx={c.x} cy={c.y} r={pinRadius} fill={COLOR[p.r.climateRating]} stroke="#fff" strokeWidth={strokeW} />
                <title>{`${p.d.flag} ${p.d.name} — ${p.r.climateRating} (${p.r.score})`}</title>
              </g>
            );
          }
          const radius = Math.min(18, pinRadius + Math.sqrt(c.pins.length) * 2.5);
          return (
            <g key={i} className="map-cluster" onClick={() => zoomBtn(1 / 2)}>
              <circle cx={c.x} cy={c.y} r={radius} fill={COLOR[c.dominantRating]} fillOpacity={0.85} stroke="#fff" strokeWidth={strokeW} />
              <text x={c.x} y={c.y + radius * 0.35} textAnchor="middle" fontSize={radius * 0.9} fill="#0a1120" fontWeight="700">{c.pins.length}</text>
              <title>{c.pins.map((p) => p.d.name).join(", ")}</title>
            </g>
          );
        })}
      </svg>
      {sel && (
        <div className="map-popover" style={{ left: sel.x, top: sel.y }} onClick={(e) => e.stopPropagation()}>
          <div className="map-popover-name">{sel.label}</div>
          <div className="map-popover-actions">
            <button className="button-secondary" onClick={() => { onOpen(sel.id); setSel(null); }}>Ver</button>
            <button className="button-primary" onClick={() => { onCreateTrip(sel.id); setSel(null); }}>+ Crear viaje</button>
          </div>
        </div>
      )}
      <div className="map-legend">
        <span><i style={{ background: COLOR.ideal }} /> Ideal</span>
        <span><i style={{ background: COLOR.good }} /> Bueno</span>
        <span><i style={{ background: COLOR.ok }} /> Aceptable</span>
        <span><i style={{ background: COLOR.avoid }} /> Evitar</span>
        <span className="map-hint">Rueda = zoom · arrastrar = pan · click en grupo = acercar</span>
        {missing > 0 && <span className="map-missing">{missing} sin coords</span>}
      </div>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}
function clampVb(v: { x: number; y: number; w: number; h: number }) {
  return {
    x: clamp(v.x, -v.w * 0.1, VB_W - v.w * 0.9),
    y: clamp(v.y, -v.h * 0.1, VB_H - v.h * 0.9),
    w: v.w,
    h: v.h,
  };
}
