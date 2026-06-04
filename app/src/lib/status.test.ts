import { describe, it, expect } from "vitest";
import { autoStatus, daysUntilStart, daysUntilEnd } from "./status";
import type { Trip } from "../types";

const iso = (offsetDays: number): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const trip = (start: string, end: string, status: Trip["status"] = "planning"): Trip => ({
  id: "t", title: "T", startDate: start, endDate: end, origin: "", destinations: ["X"],
  travelers: 1, status,
});

describe("autoStatus", () => {
  it("marca pasado cuando terminó", () => {
    expect(autoStatus(trip(iso(-10), iso(-5)))).toBe("past");
  });
  it("marca en curso durante el viaje", () => {
    expect(autoStatus(trip(iso(-1), iso(1)))).toBe("in-progress");
  });
  it("respeta planning/booked para viajes futuros", () => {
    expect(autoStatus(trip(iso(10), iso(20), "planning"))).toBe("planning");
    expect(autoStatus(trip(iso(10), iso(20), "booked"))).toBe("booked");
  });
});

describe("daysUntil", () => {
  it("cuenta días al inicio y fin", () => {
    expect(daysUntilStart(trip(iso(5), iso(12)))).toBe(5);
    expect(daysUntilEnd(trip(iso(5), iso(12)))).toBe(12);
  });
});
