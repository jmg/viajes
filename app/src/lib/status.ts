import type { Trip, TripStatus } from "../types";

const today0 = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const parse = (iso: string): Date => new Date(iso + "T00:00:00");

export function autoStatus(trip: Trip): TripStatus {
  const now = today0();
  const start = parse(trip.startDate);
  const end = parse(trip.endDate);
  if (now > end) return "past";
  if (now >= start) return "in-progress";
  // future trips keep their user-set status (planning vs booked)
  return trip.status === "booked" ? "booked" : "planning";
}

export function daysUntilStart(trip: Trip): number {
  const ms = parse(trip.startDate).getTime() - today0().getTime();
  return Math.ceil(ms / 86_400_000);
}

export function daysUntilEnd(trip: Trip): number {
  const ms = parse(trip.endDate).getTime() - today0().getTime();
  return Math.ceil(ms / 86_400_000);
}

export const STATUS_LABEL: Record<TripStatus, string> = {
  planning: "Planeando",
  booked: "Reservado",
  "in-progress": "En curso",
  past: "Pasado",
};
