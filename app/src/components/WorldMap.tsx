import type { ClimateRating, Destination, RecommendationResult } from "../destinations/types";

type Props = {
  results: RecommendationResult[];
  onOpen: (id: string) => void;
};

// Proyección equirectangular: (lat, lng) → (x, y) en un viewBox 0..1000 × 0..500.
function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * 1000,
    y: ((90 - lat) / 180) * 500,
  };
}

const COLOR: Record<ClimateRating, string> = {
  ideal: "#34d399",
  good: "#38bdf8",
  ok: "#fbbf24",
  avoid: "#f87171",
};

type Pin = { r: RecommendationResult; lat: number; lng: number; d: Destination };

export function WorldMap({ results, onOpen }: Props) {
  const pins: Pin[] = [];
  for (const r of results) {
    const { lat, lng } = r.destination;
    if (typeof lat === "number" && typeof lng === "number") {
      pins.push({ r, lat, lng, d: r.destination });
    }
  }
  const missing = results.length - pins.length;

  return (
    <div className="world-map-wrap">
      <svg viewBox="0 0 1000 500" className="world-map" role="img" aria-label="Mapa de destinos">
        <rect width="1000" height="500" fill="#0a1120" />
        {/* Grid: ecuador, trópicos y meridiano de Greenwich */}
        <g className="map-grid">
          <line x1="0" y1="250" x2="1000" y2="250" />
          <line x1="0" y1="186.7" x2="1000" y2="186.7" strokeDasharray="3 4" />
          <line x1="0" y1="313.3" x2="1000" y2="313.3" strokeDasharray="3 4" />
          <line x1="500" y1="0" x2="500" y2="500" />
        </g>
        {/* Labels */}
        <g className="map-labels">
          <text x="6" y="246">Ecuador</text>
          <text x="6" y="182">T. Cáncer</text>
          <text x="6" y="309">T. Capricornio</text>
        </g>
        {/* Pins */}
        {pins.map(({ r, lat, lng, d }) => {
          const { x, y } = project(lat, lng);
          return (
            <g key={d.id} className="map-pin" onClick={() => onOpen(d.id)}>
              <circle cx={x} cy={y} r={5} fill={COLOR[r.climateRating]} stroke="#fff" strokeWidth={1} />
              <title>{`${d.flag} ${d.name} — ${r.climateRating} (${r.score})`}</title>
            </g>
          );
        })}
      </svg>
      <div className="map-legend">
        <span><i style={{ background: COLOR.ideal }} /> Ideal</span>
        <span><i style={{ background: COLOR.good }} /> Bueno</span>
        <span><i style={{ background: COLOR.ok }} /> Aceptable</span>
        <span><i style={{ background: COLOR.avoid }} /> Evitar</span>
        {missing > 0 && <span className="map-missing">{missing} destinos sin lat/lng (no se ven en el mapa)</span>}
      </div>
    </div>
  );
}
