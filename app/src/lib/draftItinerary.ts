import type { ItineraryDay, Trip } from "../types";
import { daysBetween } from "./format";

// Genera un borrador de itinerario SIN IA: reparte los destinos a lo largo de
// los días y arma títulos/actividades sensatas. Sirve como punto de partida
// editable y como demo del formato cuando no hay API key configurada.

const MID_TEMPLATES: { title: (d: string) => string; highlights: string[]; emoji: string }[] = [
  { title: (d) => `Explorar ${d}`, highlights: ["Atracciones principales", "Almuerzo típico", "Caminata por el centro"], emoji: "🗺" },
  { title: () => "Día de playa / paseo", highlights: ["Mañana al aire libre", "Tarde relajada", "Atardecer"], emoji: "🏖" },
  { title: (d) => `Excursión cerca de ${d}`, highlights: ["Salida de día completo", "Volver al atardecer"], emoji: "🚐" },
  { title: () => "Cultura y gastronomía", highlights: ["Museo o sitio histórico", "Mercado local", "Cena especial"], emoji: "🏛" },
  { title: () => "Día libre", highlights: ["Descanso o compras", "Lo que quedó pendiente"], emoji: "🌞" },
];

export function draftItinerary(trip: Trip): ItineraryDay[] {
  const total = daysBetween(trip.startDate, trip.endDate) + 1;
  if (total <= 0) return [];

  const dests = trip.destinations.length ? trip.destinations : ["Destino"];
  const perDest = Math.max(1, Math.ceil(total / dests.length));
  const start = new Date(trip.startDate + "T00:00:00");
  const days: ItineraryDay[] = [];

  for (let i = 0; i < total; i++) {
    const date = new Date(start.getTime() + i * 86_400_000).toISOString().slice(0, 10);
    const destIdx = Math.min(dests.length - 1, Math.floor(i / perDest));
    const dest = dests[destIdx];
    const firstAtDest = i === 0 || Math.floor(i / perDest) !== Math.floor((i - 1) / perDest);
    const isLast = i === total - 1;

    let title: string;
    let highlights: string[];
    let emoji: string;

    if (i === 0) {
      title = `Llegada a ${dest}`;
      highlights = ["Check-in y acomodarse", "Primera vuelta por la zona", "Cena tranquila"];
      emoji = "🛬";
    } else if (isLast) {
      title = "Día de regreso";
      highlights = ["Últimas compras", "Check-out", "Traslado y vuelo"];
      emoji = "🛫";
    } else if (firstAtDest) {
      title = `Traslado a ${dest}`;
      highlights = [`Viaje a ${dest}`, "Reconocer el lugar", "Comida local"];
      emoji = "🚐";
    } else {
      const tpl = MID_TEMPLATES[i % MID_TEMPLATES.length];
      title = tpl.title(dest);
      highlights = [...tpl.highlights];
      emoji = tpl.emoji;
    }

    days.push({ dayNumber: i + 1, date, location: dest, title, highlights, emoji });
  }

  return days;
}
