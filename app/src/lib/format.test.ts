import { describe, it, expect, afterEach } from "vitest";
import { setModuleLang } from "../i18n/core";
import { formatDate, daysBetween, monthName, moonName } from "./format";

afterEach(() => setModuleLang("es"));

describe("daysBetween", () => {
  it("cuenta días calendario", () => {
    expect(daysBetween("2026-01-01", "2026-01-08")).toBe(7);
    expect(daysBetween("2026-01-01", "2026-01-01")).toBe(0);
  });
});

describe("formato dependiente del idioma", () => {
  it("monthName cambia con el idioma", () => {
    setModuleLang("es");
    expect(monthName(1)).toBe("Enero");
    setModuleLang("pt");
    expect(monthName(1)).toBe("Janeiro");
    setModuleLang("en");
    expect(monthName(1)).toBe("January");
  });

  it("formatDate usa día/mes localizados", () => {
    setModuleLang("es");
    expect(formatDate("2026-01-05")).toBe("lun 5 ene"); // 5-ene-2026 es lunes
    setModuleLang("en");
    expect(formatDate("2026-01-05")).toBe("Mon 5 Jan");
  });

  it("moonName traduce las fases", () => {
    setModuleLang("es");
    expect(moonName("full")).toBe("Luna llena");
    setModuleLang("en");
    expect(moonName("full")).toBe("Full moon");
    expect(moonName("desconocida")).toBe("desconocida");
  });
});
