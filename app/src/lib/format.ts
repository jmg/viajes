const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const WEEKDAYS_ES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export const formatDate = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  const wd = WEEKDAYS_ES[d.getDay()];
  return `${wd} ${d.getDate()} ${MONTHS_ES[d.getMonth()]}`;
};

export const formatDateLong = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  if (sameMonth) {
    return `${s.getDate()} – ${e.getDate()} ${MONTHS_ES[s.getMonth()]} ${s.getFullYear()}`;
  }
  if (sameYear) {
    return `${s.getDate()} ${MONTHS_ES[s.getMonth()]} – ${e.getDate()} ${MONTHS_ES[e.getMonth()]} ${s.getFullYear()}`;
  }
  return `${formatDateLong(start)} – ${formatDateLong(end)}`;
};

export const daysBetween = (start: string, end: string): number => {
  const s = new Date(start + "T00:00:00").getTime();
  const e = new Date(end + "T00:00:00").getTime();
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
};

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

export const moonName = (phase: string): string => {
  switch (phase) {
    case "new": return "Luna nueva";
    case "first-quarter": return "Cuarto creciente";
    case "full": return "Luna llena";
    case "last-quarter": return "Cuarto menguante";
    case "supermoon": return "Supermoon";
    default: return phase;
  }
};
