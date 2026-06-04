// Helpers de etiquetas localizadas para enums del catálogo. Reemplazan a los
// CATEGORY_LABEL / COST_LABEL / etc. estáticos de destinations/types.ts.
import { t, getLang } from "./core";
import type { Lang } from "./core";
import type { DestinationCategory, CostTier, ClimateRating, VisaStatus } from "../destinations/types";
import type { TemplateId } from "../lib/templates";

export const templateLabel = (id: TemplateId): string => t(`tpl.${id}`);
export const catLabel = (c: DestinationCategory): string => t(`dest.cat.${c}`);
export const costLabel = (c: CostTier): string => t(`dest.cost.${c}`);
export const ratingLabel = (r: ClimateRating): string => t(`dest.rating.${r}`);
export const ratingTip = (r: ClimateRating): string => t(`dest.ratingTip.${r}`);
export const visaLabel = (v: VisaStatus): string => t(`dest.visa.${v}`);

// Las regiones se guardan en español (valor canónico que usa el filtro y los
// datos del catálogo). Acá solo traducimos su VISUALIZACIÓN.
const REGION_LABELS: Record<string, Record<Lang, string>> = {
  "Sudamérica": { es: "Sudamérica", pt: "América do Sul", en: "South America" },
  "Norteamérica": { es: "Norteamérica", pt: "América do Norte", en: "North America" },
  "Centroamérica": { es: "Centroamérica", pt: "América Central", en: "Central America" },
  "Caribe": { es: "Caribe", pt: "Caribe", en: "Caribbean" },
  "Europa": { es: "Europa", pt: "Europa", en: "Europe" },
  "Asia": { es: "Asia", pt: "Ásia", en: "Asia" },
  "Oceanía": { es: "Oceanía", pt: "Oceania", en: "Oceania" },
  "África": { es: "África", pt: "África", en: "Africa" },
};

export const regionLabel = (r: string): string => REGION_LABELS[r]?.[getLang()] ?? r;
