import type { Trip } from "../types";

// Genera un archivo .ics (iCalendar / RFC 5545) con un evento por día del
// itinerario más un evento que abarca todo el viaje. Se importa en Google
// Calendar, Apple Calendar, Outlook, etc.

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function dateOnly(iso: string): string {
  return iso.replace(/-/g, "");
}

function addDay(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function nowStamp(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 manda líneas ≤ 75 octetos; continuación arranca con un espacio. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let i = 0;
  while (i < line.length) {
    parts.push((i === 0 ? "" : " ") + line.slice(i, i + 74));
    i += 74;
  }
  return parts.join("\r\n");
}

export function tripToIcs(trip: Trip): string {
  const out: string[] = [];
  const stamp = nowStamp();
  const push = (l: string) => out.push(fold(l));

  push("BEGIN:VCALENDAR");
  push("VERSION:2.0");
  push("PRODID:-//Viajes//ES");
  push("CALSCALE:GREGORIAN");
  push("METHOD:PUBLISH");

  // Evento "todo el viaje" (all-day, multi-día)
  push("BEGIN:VEVENT");
  push(`UID:trip-${trip.id}@viajes`);
  push(`DTSTAMP:${stamp}`);
  push(`DTSTART;VALUE=DATE:${dateOnly(trip.startDate)}`);
  push(`DTEND;VALUE=DATE:${dateOnly(addDay(trip.endDate))}`); // DTEND es exclusivo
  push(`SUMMARY:${escapeIcs(`✈️ ${trip.title}`)}`);
  const tripDesc = [trip.subtitle, trip.summary, `Destinos: ${trip.destinations.join(", ")}`]
    .filter(Boolean).join("\n");
  if (tripDesc) push(`DESCRIPTION:${escapeIcs(tripDesc)}`);
  push(`LOCATION:${escapeIcs(trip.destinations.join(", "))}`);
  push("END:VEVENT");

  // Un evento all-day por día del itinerario
  for (const d of trip.itinerary ?? []) {
    push("BEGIN:VEVENT");
    push(`UID:trip-${trip.id}-day-${d.dayNumber}@viajes`);
    push(`DTSTAMP:${stamp}`);
    push(`DTSTART;VALUE=DATE:${dateOnly(d.date)}`);
    push(`DTEND;VALUE=DATE:${dateOnly(addDay(d.date))}`);
    push(`SUMMARY:${escapeIcs(`${d.emoji ?? "📍"} Día ${d.dayNumber} · ${d.title}`)}`);
    push(`LOCATION:${escapeIcs(d.location)}`);
    const desc = [
      d.highlights.map((h) => "• " + h).join("\n"),
      d.notes ? `\n${d.notes}` : "",
    ].join("").trim();
    if (desc) push(`DESCRIPTION:${escapeIcs(desc)}`);
    push("END:VEVENT");
  }

  push("END:VCALENDAR");
  return out.join("\r\n") + "\r\n";
}

export function downloadTripIcs(trip: Trip): void {
  const ics = tripToIcs(trip);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const safe = trip.title.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "");
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe || "viaje"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
