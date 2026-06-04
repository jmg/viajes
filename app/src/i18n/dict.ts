// Ensambla todas las "partes" de traducción en un único diccionario por idioma.
// Cada parte aporta su propio namespace (sin colisiones), así se pueden editar
// de forma independiente. Para agregar texto nuevo: creá/editá una parte y, si
// es nueva, sumala al array PARTS.
import { common } from "./parts/common";
import { home } from "./parts/home";
import { settings } from "./parts/settings";
import { discover } from "./parts/discover";
import { destination } from "./parts/destination";
import { tripForm } from "./parts/tripForm";
import { tripWizard } from "./parts/tripWizard";
import { tripDetail } from "./parts/tripDetail";
import { itinerary } from "./parts/itinerary";
import { editors } from "./parts/editors";
import { weather } from "./parts/weather";
import { moon } from "./parts/moon";
import { booking } from "./parts/booking";
import { flights } from "./parts/flights";
import { share } from "./parts/share";
import { help } from "./parts/help";
import { currency } from "./parts/currency";
import { recommender } from "./parts/recommender";

export type Lang = "es" | "pt" | "en";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

type Dict = Record<string, unknown>;
export type Part = { es: Dict; pt: Dict; en: Dict };

const PARTS: Part[] = [
  common, home, settings, discover, destination, tripForm, tripWizard, tripDetail,
  itinerary, editors, weather, moon, booking, flights, share, help, currency, recommender,
];

function build(lang: Lang): Dict {
  const out: Dict = {};
  for (const p of PARTS) Object.assign(out, p[lang]);
  return out;
}

export const DICT: Record<Lang, Dict> = {
  es: build("es"),
  pt: build("pt"),
  en: build("en"),
};
