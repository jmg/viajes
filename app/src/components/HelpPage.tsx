import { useT } from "../i18n";

type Props = { onBack: () => void; onDiscover: () => void };

export function HelpPage({ onBack, onDiscover }: Props) {
  const t = useT();
  return (
    <div className="help-page">
      <button className="back-button" onClick={onBack}>{t("help.back")}</button>

      <header className="help-hero">
        <h1>{t("help.title")}</h1>
        <p>{t("help.intro")}</p>
      </header>

      <section className="help-section">
        <h2>{t("help.s1Title")}</h2>
        <ol className="help-steps">
          <li><strong>{t("help.s1Step1Lead")}</strong>{t("help.s1Step1Body")}</li>
          <li><strong>{t("help.s1Step2Lead")}</strong>{t("help.s1Step2Body")}</li>
          <li><strong>{t("help.s1Step3Lead")}</strong>{t("help.s1Step3Body")}</li>
        </ol>
        <p>{t("help.s1Note1")}<strong>{t("help.s1NoteStrong")}</strong>{t("help.s1Note2")}</p>
      </section>

      <section className="help-section">
        <h2>{t("help.s7Title")}</h2>
        <p>{t("help.s7Intro")}</p>
        <ul>
          <li><strong>{t("help.s7Li1Strong")}</strong>{t("help.s7Li1Body")}</li>
          <li><strong>{t("help.s7Li2Strong")}</strong>{t("help.s7Li2Body")}</li>
          <li><strong>{t("help.s7Li3Strong")}</strong>{t("help.s7Li3Body")}</li>
          <li><strong>{t("help.s7Li4Strong")}</strong>{t("help.s7Li4Body")}</li>
        </ul>
        <p>{t("help.s7Foot")}</p>
      </section>

      <section className="help-section">
        <h2>{t("help.s8Title")}</h2>
        <p>{t("help.s8Intro")}</p>
        <ul>
          <li><strong>{t("help.s8Li1Strong")}</strong>{t("help.s8Li1Body")}</li>
          <li><strong>{t("help.s8Li2Strong")}</strong>{t("help.s8Li2Body")}</li>
          <li><strong>{t("help.s8Li3Strong")}</strong>{t("help.s8Li3Body")}</li>
        </ul>
      </section>

      <section className="help-section">
        <h2>{t("help.s2Title")}</h2>
        <p>{t("help.s2Intro1")}<strong>{t("help.s2IntroStrong")}</strong>{t("help.s2Intro2")}</p>
        <div className="help-defs">
          <div className="help-def">
            <h3>{t("help.s2Def1Title")}</h3>
            <p>{t("help.s2Def1Body1")}<strong>{t("help.s2Def1Strong1")}</strong>{t("help.s2Def1Body2")}<strong>{t("help.s2Def1Strong2")}</strong>{t("help.s2Def1Body3")}<em>{t("help.s2Def1Em")}</em>{t("help.s2Def1Body4")}</p>
          </div>
          <div className="help-def">
            <h3>{t("help.s2Def2Title")}</h3>
            <p>{t("help.s2Def2Body1")}<strong>{t("help.s2Def2Strong")}</strong>{t("help.s2Def2Body2")}<em>{t("help.s2Def2Em")}</em>{t("help.s2Def2Body3")}</p>
            <ul>
              <li><strong>{t("help.s2Def2Li1Strong")}</strong>{t("help.s2Def2Li1")}</li>
              <li><strong>{t("help.s2Def2Li2Strong")}</strong>{t("help.s2Def2Li2")}</li>
              <li><strong>{t("help.s2Def2Li3Strong")}</strong>{t("help.s2Def2Li3")}</li>
              <li><strong>{t("help.s2Def2Li4Strong")}</strong>{t("help.s2Def2Li4")}</li>
            </ul>
            <p>{t("help.s2Def2Foot")}</p>
          </div>
          <div className="help-def">
            <h3>{t("help.s2Def3Title")}</h3>
            <p>{t("help.s2Def3Body1")}<strong>{t("help.s2Def3Strong")}</strong>{t("help.s2Def3Body2")}</p>
          </div>
          <div className="help-def">
            <h3>{t("help.s2Def4Title")}</h3>
            <p>{t("help.s2Def4Body")}</p>
          </div>
        </div>
      </section>

      <section className="help-section">
        <h2>{t("help.s3Title")}</h2>
        <p>{t("help.s3Intro")}</p>
        <ul className="help-ratings">
          <li><span className="rating-pill rating-ideal">{t("help.s3IdealPill")}</span>{t("help.s3IdealBody")}</li>
          <li><span className="rating-pill rating-good">{t("help.s3GoodPill")}</span>{t("help.s3GoodBody")}</li>
          <li><span className="rating-pill rating-ok">{t("help.s3OkPill")}</span>{t("help.s3OkBody")}</li>
          <li><span className="rating-pill rating-avoid">{t("help.s3AvoidPill")}</span>{t("help.s3AvoidBody")}</li>
        </ul>
        <p>{t("help.s3Foot")}</p>
      </section>

      <section className="help-section">
        <h2>{t("help.s4Title")}</h2>
        <p>{t("help.s4Intro")}</p>
        <ul>
          <li><strong>{t("help.s4Li1Strong")}</strong>{t("help.s4Li1Body")}</li>
          <li><strong>{t("help.s4Li2Strong")}</strong>{t("help.s4Li2Body1")}<strong>{t("help.s4Li2Strong2")}</strong>{t("help.s4Li2Body2")}<strong>{t("help.s4Li2Strong3")}</strong>{t("help.s4Li2Body3")}</li>
        </ul>
        <p>{t("help.s4Mid")}</p>
        <ul>
          <li><strong>{t("help.s4Li3Strong")}</strong>{t("help.s4Li3Body1")}<em>{t("help.s4Li3Em")}</em>{t("help.s4Li3Body2")}</li>
          <li><strong>{t("help.s4Li4Strong")}</strong>{t("help.s4Li4Body1")}<em>{t("help.s4Li4Em")}</em>{t("help.s4Li4Body2")}</li>
          <li><strong>{t("help.s4Li5Strong")}</strong>{t("help.s4Li5Body1")}<em>{t("help.s4Li5Em")}</em>{t("help.s4Li5Body2")}</li>
        </ul>
      </section>

      <section className="help-section">
        <h2>{t("help.s5Title")}</h2>
        <ul>
          <li><strong>{t("help.s5Li1Strong")}</strong>{t("help.s5Li1Body")}</li>
          <li><strong>{t("help.s5Li2Strong")}</strong>{t("help.s5Li2Body")}</li>
        </ul>
      </section>

      <section className="help-section">
        <h2>{t("help.s6Title")}</h2>
        <p>{t("help.s6Body1")}<strong>{t("help.s6Strong1")}</strong>{t("help.s6Body2")}<strong>{t("help.s6Strong2")}</strong>{t("help.s6Body3")}<strong>{t("help.s6Strong3")}</strong>{t("help.s6Body4")}<strong>{t("help.s6Strong4")}</strong>{t("help.s6Body5")}</p>
      </section>

      <div className="help-cta">
        <button className="button-primary" onClick={onDiscover}>{t("help.cta")}</button>
      </div>

      <p className="help-foot">{t("help.footPre")}<a href="https://open-meteo.com" target="_blank" rel="noreferrer">{t("help.footLink")}</a>{t("help.footPost")}</p>
    </div>
  );
}
