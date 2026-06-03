// Tipos del recomendador de destinos.

export type DestinationCategory =
  | "beach"
  | "mountain"
  | "city"
  | "cultural"
  | "nature"
  | "snow"
  | "desert"
  | "tropical"
  | "island"
  | "lake"
  | "wine"
  | "wildlife";

export type Hemisphere = "north" | "south" | "equator";

export type CostTier = "budget" | "mid" | "expensive";

export type VisaStatus = "none" | "evisa" | "required";

export type MonthClimate = {
  highC: number;
  lowC: number;
  rainMm: number;
  sunHours?: number;
  seaTempC?: number;
};

export type Destination = {
  id: string;
  name: string;
  country: string;
  region: string;
  hemisphere: Hemisphere;
  flag: string;
  /** Lat/lng opcionales — útiles para mapa y para regenerar el clima con Open-Meteo. */
  lat?: number;
  lng?: number;
  categories: DestinationCategory[];
  /** 12 entries, ene…dic */
  climate: MonthClimate[];
  costTier: CostTier;
  costPerDayUsd?: { min: number; max: number };
  highlights: string[];
  description: string;
  bestMonths: number[];
  flightHoursFromEze?: number;
  visaForArgentines?: VisaStatus;
  suggestedDuration?: { min: number; max: number };
};

export type RecommendationCriteria = {
  month: number;
  duration?: number;
  categories?: DestinationCategory[];
  preferredTempC?: { min: number; max: number };
  /** Lluvia máxima buscada (mm/mes). undefined = sin preferencia (tolerante). */
  maxRainMm?: number;
  maxCostTier?: CostTier;
  maxFlightHours?: number;
  /** Regiones a incluir. Vacío/undefined = todas. */
  includeRegions?: string[];
  search?: string;
};

export type ClimateRating = "ideal" | "good" | "ok" | "avoid";

export type RecommendationResult = {
  destination: Destination;
  score: number;
  climateRating: ClimateRating;
  reasons: string[];
  warnings: string[];
};

export const CATEGORY_LABEL: Record<DestinationCategory, string> = {
  beach: "Playa",
  mountain: "Montaña",
  city: "Ciudad",
  cultural: "Cultural",
  nature: "Naturaleza",
  snow: "Nieve / ski",
  desert: "Desierto",
  tropical: "Tropical",
  island: "Isla",
  lake: "Lagos",
  wine: "Vino",
  wildlife: "Fauna",
};

export const CATEGORY_EMOJI: Record<DestinationCategory, string> = {
  beach: "🏖",
  mountain: "🏔",
  city: "🏙",
  cultural: "🏛",
  nature: "🌿",
  snow: "⛷",
  desert: "🏜",
  tropical: "🌴",
  island: "🏝",
  lake: "💧",
  wine: "🍷",
  wildlife: "🦒",
};

export const COST_LABEL: Record<CostTier, string> = {
  budget: "Económico",
  mid: "Medio",
  expensive: "Caro",
};

export const COST_RANGE_USD: Record<CostTier, string> = {
  budget: "< 60",
  mid: "60–150",
  expensive: "> 150",
};
