// Tipos base para describir un viaje. Todo es opcional menos lo mínimo
// (id, título, fechas, destinos), para que sea fácil agregar viajes nuevos
// con la cantidad de detalle que tenga cada uno.

export type Score = 1 | 2 | 3 | 4 | 5;

export type FlightOption = {
  id: string | number;
  outbound: FlightLeg;
  inbound: FlightLeg;
  days: number;
  score?: Score;
  comment?: string;
  isTop?: boolean;
  rank?: 1 | 2 | 3;
  criteria?: Record<string, CriteriaValue>;
};

export type FlightLeg = {
  date: string;
  from: string;
  to: string;
  airline: string;
  depart: string;
  arrive: string;
  direct: boolean;
  notes?: string;
};

export type CriteriaValue = "yes" | "no" | "partial" | "warning" | string;

export type ItineraryDay = {
  dayNumber: number;
  date: string;
  location: string;
  title: string;
  highlights: string[];
  notes?: string;
  emoji?: string;
};

export type MoonPhase = {
  date: string;
  phase: "new" | "first-quarter" | "full" | "last-quarter" | "supermoon";
  tideQuality: "low" | "medium" | "high" | "extreme";
  note?: string;
};

export type TideWindow = {
  label: string;
  range: string;
  quality: "good" | "very-good" | "exceptional" | "regular";
  note?: string;
};

export type BudgetItem = {
  label: string;
  minUsd: number;
  maxUsd: number;
};

export type ChecklistItem = {
  label: string;
  category?: string;
};

export type LinkRef = {
  label: string;
  url: string;
  category?: string;
};

export type TripStatus = "planning" | "booked" | "in-progress" | "past";

export type Currency = "USD" | "EUR" | "ARS" | "BRL" | "GBP" | "MXN" | "CLP";

export type Trip = {
  id: string;
  title: string;
  subtitle?: string;
  startDate: string;
  endDate: string;
  origin: string;
  destinations: string[];
  travelers: number;
  status: TripStatus;
  /** If true the moon phases tab is shown and phases are auto-computed when not provided */
  coastal?: boolean;
  summary?: string;

  // Secciones opcionales — cada viaje activa las que aplica
  flightOptions?: FlightOption[];
  flightCriteria?: FlightCriterion[];
  recommendedFlightId?: string | number;

  itinerary?: ItineraryDay[];

  moonPhases?: MoonPhase[];
  tideWindows?: TideWindow[];

  budget?: BudgetItem[];
  checklist?: ChecklistItem[];
  links?: LinkRef[];
};

export type FlightCriterion = {
  key: string;
  label: string;
  weight?: number;
};
