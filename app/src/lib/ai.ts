import Anthropic from "@anthropic-ai/sdk";
import type { ItineraryDay, Trip } from "../types";
import type { AiModel } from "./settings";

export type GenerateParams = {
  apiKey: string;
  model: AiModel;
  trip: Trip;
  preferences?: string;
};

const ITINERARY_SCHEMA = {
  type: "object",
  properties: {
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dayNumber: { type: "integer" },
          date: { type: "string", description: "Fecha ISO YYYY-MM-DD" },
          location: { type: "string" },
          title: { type: "string" },
          highlights: { type: "array", items: { type: "string" } },
          notes: { type: "string" },
          emoji: { type: "string", description: "Un solo emoji representativo del día" },
        },
        required: ["dayNumber", "date", "location", "title", "highlights", "emoji"],
        additionalProperties: false,
      },
    },
  },
  required: ["days"],
  additionalProperties: false,
} as const;

const SYSTEM = `Sos un planificador de viajes experto. Generás itinerarios día por día concretos, realistas y específicos.
Reglas:
- Usá lugares, barrios y actividades reales del destino (no genéricos).
- Equilibrá imperdibles con tiempo de descanso; tené en cuenta traslados entre ciudades.
- 2 a 4 highlights por día, concisos y accionables.
- Respetá las fechas exactas provistas (una entrada por día del viaje).
- Escribí en español rioplatense, breve y claro.
- Tené en cuenta el clima de la época y las preferencias del viajero.`;

export async function generateItinerary({ apiKey, model, trip, preferences }: GenerateParams): Promise<ItineraryDay[]> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const userPrompt = [
    `Destino(s): ${trip.destinations.join(", ")}`,
    `Origen: ${trip.origin || "no especificado"}`,
    `Fechas: del ${trip.startDate} al ${trip.endDate}`,
    `Viajeros: ${trip.travelers}`,
    trip.summary ? `Contexto: ${trip.summary}` : "",
    preferences ? `Preferencias: ${preferences}` : "",
    "",
    `Generá un itinerario con una entrada por cada día entre ${trip.startDate} y ${trip.endDate} (inclusive), numeradas desde 1, con la fecha ISO correspondiente.`,
  ].filter(Boolean).join("\n");

  const stream = client.messages.stream({
    model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
    // Structured outputs: constrain the response to our itinerary schema.
    output_config: { format: { type: "json_schema", schema: ITINERARY_SCHEMA } },
  } as Anthropic.MessageStreamParams);

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error("El modelo rechazó la solicitud. Probá con otro destino o redacción.");
  }

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("La respuesta no contiene texto. Intentá de nuevo.");
  }

  let parsed: { days: ItineraryDay[] };
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    throw new Error("No se pudo interpretar la respuesta del modelo.");
  }

  return parsed.days
    .map((d) => ({
      dayNumber: d.dayNumber,
      date: d.date,
      location: d.location,
      title: d.title,
      highlights: Array.isArray(d.highlights) ? d.highlights : [],
      notes: d.notes,
      emoji: d.emoji ?? "📍",
    }))
    .sort((a, b) => a.dayNumber - b.dayNumber);
}

export type ParsedReservation = {
  type: "vuelo" | "hotel" | "tour" | "auto" | "otro";
  title: string;
  origin?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  provider?: string;
  confirmationCode?: string;
  details: string;
};

const RESERVATION_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["vuelo", "hotel", "tour", "auto", "otro"] },
    title: { type: "string" },
    origin: { type: "string" },
    destination: { type: "string" },
    startDate: { type: "string", description: "Fecha ISO YYYY-MM-DD o vacío" },
    endDate: { type: "string", description: "Fecha ISO YYYY-MM-DD o vacío" },
    provider: { type: "string" },
    confirmationCode: { type: "string" },
    details: { type: "string", description: "Resumen legible de la reserva" },
  },
  required: ["type", "title", "details"],
  additionalProperties: false,
} as const;

export async function parseReservation(apiKey: string, model: AiModel, text: string): Promise<ParsedReservation> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const stream = client.messages.stream({
    model,
    max_tokens: 4000,
    system:
      "Extraés datos de confirmaciones de reservas de viaje (vuelos, hoteles, tours, autos) pegadas por el usuario. " +
      "Devolvés un objeto estructurado. Convertí fechas a ISO YYYY-MM-DD. Si un campo no aparece, dejalo vacío. " +
      "El resumen 'details' debe ser breve y legible, en español.",
    messages: [{ role: "user", content: `Extraé los datos de esta reserva:\n\n${text}` }],
    output_config: { format: { type: "json_schema", schema: RESERVATION_SCHEMA } },
  } as Anthropic.MessageStreamParams);

  const message = await stream.finalMessage();
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Respuesta vacía del modelo.");

  try {
    return JSON.parse(textBlock.text) as ParsedReservation;
  } catch {
    throw new Error("No se pudo interpretar la reserva.");
  }
}

export function describeAiError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "API key inválida. Revisá tu clave en Configuración.";
  if (e instanceof Anthropic.RateLimitError) return "Límite de tasa alcanzado. Esperá unos segundos y reintentá.";
  if (e instanceof Anthropic.PermissionDeniedError) return "Tu API key no tiene permiso para este modelo.";
  if (e instanceof Anthropic.APIConnectionError) return "Error de conexión. Revisá tu internet.";
  if (e instanceof Anthropic.APIError) return `Error de la API (${e.status ?? "?"}): ${e.message}`;
  if (e instanceof Error) return e.message;
  return "Error desconocido al generar el itinerario.";
}
