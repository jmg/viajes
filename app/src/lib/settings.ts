export type AiModel = "claude-opus-4-8" | "claude-sonnet-4-6" | "claude-haiku-4-5";

export type Settings = {
  anthropicApiKey: string;
  aiModel: AiModel;
  originCity: string;
  /** Supabase URL del proyecto del usuario (BYOC) */
  supabaseUrl: string;
  /** Supabase anon/public key */
  supabaseAnonKey: string;
  /** Afiliado opcional (revenue): ID de Skyscanner/Booking para deep links */
  skyscannerAffiliate: string;
  bookingAffiliate: string;
  /** Endpoint opcional para reenviar eventos de uso (analytics) */
  analyticsEndpoint: string;
};

const KEY = "viajes:settings:v1";

const DEFAULTS: Settings = {
  anthropicApiKey: "",
  aiModel: "claude-opus-4-8",
  originCity: "Buenos Aires",
  supabaseUrl: "",
  supabaseAnonKey: "",
  skyscannerAffiliate: "",
  bookingAffiliate: "",
  analyticsEndpoint: "",
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const AI_MODEL_LABEL: Record<AiModel, string> = {
  "claude-opus-4-8": "Claude Opus 4.8 (mejor calidad)",
  "claude-sonnet-4-6": "Claude Sonnet 4.6 (balance)",
  "claude-haiku-4-5": "Claude Haiku 4.5 (rápido y barato)",
};
