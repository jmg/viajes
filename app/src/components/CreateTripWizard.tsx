import { useState } from "react";
import type { Destination } from "../destinations/types";
import { TEMPLATES } from "../lib/templates";
import type { TemplateId } from "../lib/templates";
import { formatDateRange, daysBetween } from "../lib/format";
import { useT } from "../i18n";

export type WizardResult = {
  startDate: string;
  endDate: string;
  travelers: number;
  origin: string;
  title: string;
  templateId: TemplateId;
};

type Props = {
  destination: Destination;
  initialStart: string;
  initialEnd: string;
  defaultOrigin?: string;
  onCreate: (result: WizardResult) => void;
  onCancel: () => void;
};

const TOTAL = 3;

export function CreateTripWizard({ destination, initialStart, initialEnd, defaultOrigin, onCreate, onCancel }: Props) {
  const t = useT();
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [travelers, setTravelers] = useState(1);
  const [origin, setOrigin] = useState(defaultOrigin ?? "");
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("blank");
  const [error, setError] = useState<string | null>(null);

  const dayCount = startDate && endDate && endDate >= startDate
    ? daysBetween(startDate, endDate)
    : 0;

  const next = () => {
    setError(null);
    if (step === 1 && (!startDate || !endDate || endDate < startDate)) {
      return setError(t("tripWizard.errDates"));
    }
    setStep((s) => Math.min(TOTAL, s + 1));
  };
  const back = () => { setError(null); step === 1 ? onCancel() : setStep((s) => s - 1); };

  const confirm = () => {
    if (!startDate || !endDate || endDate < startDate) { setStep(1); return setError(t("tripWizard.errDates")); }
    onCreate({ startDate, endDate, travelers, origin: origin.trim(), title: title.trim(), templateId });
  };

  const stepTitle = step === 1 ? t("tripWizard.step1Title") : step === 2 ? t("tripWizard.step2Title") : t("tripWizard.step3Title");
  const stepSub = step === 1 ? t("tripWizard.step1Sub") : step === 2 ? t("tripWizard.step2Sub") : t("tripWizard.step3Sub");
  const tmpl = TEMPLATES.find((x) => x.id === templateId);

  return (
    <div className="wizard">
      <div className="wizard-progress">
        {Array.from({ length: TOTAL }, (_, i) => (
          <span key={i} className={`wizard-dot ${i + 1 <= step ? "active" : ""}`} />
        ))}
      </div>
      <p className="wizard-step-of">{t("tripWizard.stepOf", { n: step, total: TOTAL })}</p>
      <h3 className="wizard-step-title">{stepTitle}</h3>
      <p className="wizard-step-sub">{stepSub}</p>

      {step === 1 && (
        <>
          <div className="field-row">
            <label className="field">
              <span>{t("tripForm.departLabel")}</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="field">
              <span>{t("tripForm.returnLabel")}</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>
          {dayCount > 0 && (
            <p className="form-hint">{t("tripForm.dayCount", { n: dayCount, unit: dayCount === 1 ? t("common.day") : t("common.days") })}</p>
          )}
          <label className="field">
            <span>{t("tripForm.travelersLabel")}</span>
            <input
              type="number" min={1} max={20} value={travelers}
              onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </label>
        </>
      )}

      {step === 2 && (
        <>
          <label className="field">
            <span>{t("tripForm.originLabel")}</span>
            <input
              type="text" value={origin} placeholder={t("tripForm.originPlaceholder")}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </label>
          <label className="field">
            <span>{t("tripWizard.styleLabel")} <small>{t("tripWizard.styleHint")}</small></span>
            <div className="template-grid">
              {TEMPLATES.map((x) => (
                <button
                  key={x.id} type="button"
                  className={`template-chip ${templateId === x.id ? "active" : ""}`}
                  onClick={() => setTemplateId(x.id)}
                >
                  <span className="template-emoji">{x.emoji}</span>
                  <span>{x.label}</span>
                </button>
              ))}
            </div>
          </label>
          <label className="field">
            <span>{t("tripWizard.titleLabel")} <small>{t("tripWizard.titleHint")}</small></span>
            <input
              type="text" value={title}
              placeholder={t("tripForm.autoTitleOne", { name: destination.name })}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
        </>
      )}

      {step === 3 && (
        <dl className="wizard-review">
          <div><dt>{t("tripWizard.reviewDestination")}</dt><dd>{destination.name} · {destination.country}</dd></div>
          <div><dt>{t("tripWizard.reviewDates")}</dt><dd>{formatDateRange(startDate, endDate)}</dd></div>
          <div><dt>{t("tripWizard.reviewDuration")}</dt><dd>{dayCount} {dayCount === 1 ? t("common.day") : t("common.days")}</dd></div>
          <div><dt>{t("tripWizard.reviewTravelers")}</dt><dd>{travelers}</dd></div>
          {origin.trim() && <div><dt>{t("tripWizard.reviewOrigin")}</dt><dd>{origin.trim()}</dd></div>}
          {tmpl && tmpl.id !== "blank" && <div><dt>{t("tripWizard.reviewStyle")}</dt><dd>{tmpl.emoji} {tmpl.label}</dd></div>}
        </dl>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={back}>{t("common.back")}</button>
        {step < TOTAL
          ? <button type="button" className="button-primary" onClick={next}>{t("tripWizard.next")} →</button>
          : <button type="button" className="button-primary" onClick={confirm}>{t("tripWizard.confirm")}</button>}
      </div>
    </div>
  );
}
