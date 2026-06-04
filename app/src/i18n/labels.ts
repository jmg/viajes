// Helpers de etiquetas localizadas para enums del catálogo. Reemplazan a los
// CATEGORY_LABEL / COST_LABEL / etc. estáticos de destinations/types.ts.
import { t } from "./core";
import type { DestinationCategory, CostTier, ClimateRating, VisaStatus } from "../destinations/types";

export const catLabel = (c: DestinationCategory): string => t(`dest.cat.${c}`);
export const costLabel = (c: CostTier): string => t(`dest.cost.${c}`);
export const ratingLabel = (r: ClimateRating): string => t(`dest.rating.${r}`);
export const ratingTip = (r: ClimateRating): string => t(`dest.ratingTip.${r}`);
export const visaLabel = (v: VisaStatus): string => t(`dest.visa.${v}`);
