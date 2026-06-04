// Nombres de meses, días y fases lunares por idioma. Se usan desde lib/format.ts
// y desde los gráficos. Mantener sincronizado con LANGS.
import type { Lang } from "./dict";

export const MONTHS_SHORT: Record<Lang, string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export const MONTHS_FULL: Record<Lang, string[]> = {
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  pt: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

export const WEEKDAYS_SHORT: Record<Lang, string[]> = {
  es: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  pt: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export const MOON_NAMES: Record<Lang, Record<string, string>> = {
  es: { new: "Luna nueva", "first-quarter": "Cuarto creciente", full: "Luna llena", "last-quarter": "Cuarto menguante", supermoon: "Superluna" },
  pt: { new: "Lua nova", "first-quarter": "Quarto crescente", full: "Lua cheia", "last-quarter": "Quarto minguante", supermoon: "Superlua" },
  en: { new: "New moon", "first-quarter": "First quarter", full: "Full moon", "last-quarter": "Last quarter", supermoon: "Supermoon" },
};

/** "de" en español/portugués, "" en inglés — para formatos de fecha larga. */
export const DATE_OF_WORD: Record<Lang, string> = { es: "de ", pt: "de ", en: "" };
