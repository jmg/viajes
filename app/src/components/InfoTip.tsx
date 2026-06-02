// Tooltip de ayuda que funciona con mouse (hover) y al tocar en mobile (focus).
// El atributo title nativo no aparece en touch; esto sí.
export function InfoTip({ tip }: { tip: string }) {
  return (
    <span className="info-tip" tabIndex={0} role="button" aria-label={tip}>
      ⓘ
      <span className="info-bubble" role="tooltip">{tip}</span>
    </span>
  );
}
