import { getLang } from "../i18n/core";
import { MONTHS_SHORT, MONTHS_FULL, WEEKDAYS_SHORT, MOON_NAMES, DATE_OF_WORD } from "../i18n/dates";

export const formatDate = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  const lang = getLang();
  const wd = WEEKDAYS_SHORT[lang][d.getDay()];
  return `${wd} ${d.getDate()} ${MONTHS_SHORT[lang][d.getMonth()]}`;
};

export const formatDateLong = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  const lang = getLang();
  return `${d.getDate()} ${DATE_OF_WORD[lang]}${MONTHS_SHORT[lang][d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const lang = getLang();
  const M = MONTHS_SHORT[lang];
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  if (sameMonth) {
    return `${s.getDate()} – ${e.getDate()} ${M[s.getMonth()]} ${s.getFullYear()}`;
  }
  if (sameYear) {
    return `${s.getDate()} ${M[s.getMonth()]} – ${e.getDate()} ${M[e.getMonth()]} ${s.getFullYear()}`;
  }
  return `${formatDateLong(start)} – ${formatDateLong(end)}`;
};

export const daysBetween = (start: string, end: string): number => {
  const s = new Date(start + "T00:00:00").getTime();
  const e = new Date(end + "T00:00:00").getTime();
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
};

/** Nombre completo del mes (1-12) en el idioma actual. */
export const monthName = (month1to12: number): string => MONTHS_FULL[getLang()][month1to12 - 1];

export const moonEmoji = (phase: string): string => {
  switch (phase) {
    case "new": return "🌑";
    case "first-quarter": return "🌓";
    case "full": return "🌕";
    case "last-quarter": return "🌗";
    case "supermoon": return "🌕⭐";
    default: return "🌙";
  }
};

export const moonName = (phase: string): string => MOON_NAMES[getLang()][phase] ?? phase;
