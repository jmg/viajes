import { describe, it, expect } from "vitest";
import { encodeTrip, decodeTrip } from "./share";
import type { Trip } from "../types";

const trip: Trip = {
  id: "abc", title: "Brasil ☀️ Nordeste", subtitle: "13 días",
  startDate: "2026-11-15", endDate: "2026-11-28", origin: "Buenos Aires",
  destinations: ["Porto de Galinhas", "Maragogi"], travelers: 2, status: "planning",
};

describe("encode/decode de viaje compartido", () => {
  it("round-trip preserva el viaje (incluye UTF-8/emoji)", () => {
    const decoded = decodeTrip(encodeTrip(trip));
    expect(decoded).toEqual(trip);
  });

  it("produce base64 url-safe (sin +, /, =)", () => {
    const enc = encodeTrip(trip);
    expect(enc).not.toMatch(/[+/=]/);
  });

  it("devuelve null ante datos corruptos", () => {
    expect(decodeTrip("@@@no-es-base64@@@")).toBeNull();
  });

  it("devuelve null si faltan campos obligatorios", () => {
    const partial = btoa(JSON.stringify({ title: "sin id" }));
    expect(decodeTrip(partial)).toBeNull();
  });
});
