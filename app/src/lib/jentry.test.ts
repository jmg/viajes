import { describe, it, expect } from "vitest";
import { JENTRY_DSN, conPagina, debeReportar, urlReportable } from "./jentry";

describe("jentry en el navegador", () => {
  it("reporta al proyecto viajes (#88) del Jentry propio", () => {
    expect(JENTRY_DSN).toMatch(/^https:\/\/[0-9a-f]{32}@ba5c529907b1\.devcloudsoftware\.com\/88$/);
  });

  it("solo el build de producción en un dominio de verdad", () => {
    expect(debeReportar("viajes.deploycloudapps.com", true)).toBe(true);
    expect(debeReportar("jmg.github.io", true)).toBe(true);
    expect(debeReportar("viajes.deploycloudapps.com", false)).toBe(false);
    for (const local of ["localhost", "127.0.0.1", "[::1]", "0.0.0.0", "app.localhost", "mi-pc.local", ""]) {
      expect(debeReportar(local, true)).toBe(false);
    }
  });

  it("un link de compartir no manda el viaje que lleva en el hash", () => {
    expect(urlReportable("https://viajes.deploycloudapps.com/#share=eyJpZCI6ImFiYyJ9")).toBe(
      "https://viajes.deploycloudapps.com/#share=…",
    );
    expect(urlReportable("https://viajes.deploycloudapps.com/#/destino/recife")).toBe(
      "https://viajes.deploycloudapps.com/#/destino/recife",
    );
  });

  it("cada evento sale con la página y el navegador", () => {
    const event = conPagina(
      { message: "x", request: { method: "GET" } },
      "https://jmg.github.io/viajes/#share=abc",
      "UA/1.0",
    );
    expect(event.message).toBe("x");
    expect(event.request).toEqual({ method: "GET", url: "https://jmg.github.io/viajes/#share=…", headers: { "User-Agent": "UA/1.0" } });
  });
});
