// Analytics local-first y privacy-respecting. Cuenta eventos de uso en
// localStorage (útil para el dueño del producto durante pruebas/demos) y,
// si se configura un endpoint, los reenvía (fire-and-forget) para agregación
// real. No envía nada a terceros por defecto.

const KEY = "viajes:analytics:v1";

export type UsageStats = {
  counts: Record<string, number>;
  firstAt: string;
  recent: { e: string; t: string }[];
};

let endpoint = "";

export function setAnalyticsEndpoint(url: string): void {
  endpoint = url;
}

function load(): UsageStats {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as UsageStats;
  } catch { /* ignore */ }
  return { counts: {}, firstAt: new Date().toISOString(), recent: [] };
}

function save(s: UsageStats): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function track(event: string, props?: Record<string, unknown>): void {
  const s = load();
  s.counts[event] = (s.counts[event] ?? 0) + 1;
  s.recent.unshift({ e: event, t: new Date().toISOString() });
  s.recent = s.recent.slice(0, 100);
  save(s);

  if (endpoint) {
    try {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, props: props ?? {}, ts: Date.now() }),
        keepalive: true,
      }).catch(() => {});
    } catch { /* ignore */ }
  }
}

export function getStats(): UsageStats {
  return load();
}

export function clearStats(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export const EVENT_LABEL: Record<string, string> = {
  trip_create: "Viajes creados",
  trip_edit: "Viajes editados",
  ai_itinerary: "Itinerarios con IA",
  draft_itinerary: "Borradores (sin IA)",
  discover_open: "Aperturas de Descubrir",
  reservation_parse: "Reservas parseadas",
  reservation_create: "Viajes desde reserva",
  share_open: "Veces que se compartió",
  cloud_login: "Inicios de sesión",
  booking_click: "Clicks en reservar",
  wishlist_add: "Guardados en wishlist",
};
