import { describe, it, expect, afterEach } from "vitest";
import { DICT } from "./dict";
import type { Lang } from "./dict";
import { t, setModuleLang } from "./core";

afterEach(() => setModuleLang("es"));

const LANGS: Lang[] = ["es", "pt", "en"];

/** Todas las rutas de claves hoja de un objeto anidado. */
function keyPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("diccionario i18n", () => {
  it("es/pt/en tienen exactamente las mismas claves", () => {
    const es = new Set(keyPaths(DICT.es));
    for (const lang of ["pt", "en"] as Lang[]) {
      const other = new Set(keyPaths(DICT[lang]));
      const missing = [...es].filter((k) => !other.has(k));
      const extra = [...other].filter((k) => !es.has(k));
      expect(missing, `faltan en ${lang}`).toEqual([]);
      expect(extra, `sobran en ${lang}`).toEqual([]);
    }
  });

  it("ninguna traducción está vacía", () => {
    for (const lang of LANGS) {
      for (const path of keyPaths(DICT[lang])) {
        const value = path.split(".").reduce<any>((o, k) => o?.[k], DICT[lang]);
        expect(typeof value === "string" && value.length > 0, `${lang}:${path}`).toBe(true);
      }
    }
  });
});

describe("t()", () => {
  it("traduce según el idioma actual", () => {
    setModuleLang("es");
    expect(t("common.save")).toBe("Guardar");
    setModuleLang("pt");
    expect(t("common.save")).toBe("Salvar");
    setModuleLang("en");
    expect(t("common.save")).toBe("Save");
  });

  it("interpola parámetros", () => {
    setModuleLang("es");
    expect(t("destCard.flightFrom", { h: 5, code: "EZE" })).toBe("5h desde EZE");
  });

  it("cae a la clave cuando no existe", () => {
    expect(t("no.existe.esta.clave")).toBe("no.existe.esta.clave");
  });
});
