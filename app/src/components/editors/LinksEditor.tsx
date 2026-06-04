import { useState } from "react";
import type { LinkRef } from "../../types";
import { useT } from "../../i18n";

type Props = {
  links: LinkRef[];
  onChange: (links: LinkRef[]) => void;
};

export function LinksEditor({ links, onChange }: Props) {
  const t = useT();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [cat, setCat] = useState("");

  const add = () => {
    const l = label.trim();
    const u = url.trim();
    if (!l || !u) return;
    onChange([...links, { label: l, url: u, category: cat.trim() || undefined }]);
    setLabel("");
    setUrl("");
  };

  const remove = (url: string) => onChange(links.filter((l) => l.url !== url));

  const byCat = links.reduce<Record<string, LinkRef[]>>((acc, l) => {
    const c = l.category ?? t("links.defaultCat");
    (acc[c] ??= []).push(l);
    return acc;
  }, {});

  const knownCats = Array.from(new Set(links.map((l) => l.category).filter(Boolean) as string[]));

  return (
    <div className="links-editor">
      <div className="links-add">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("links.namePlaceholder")} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        <input value={cat} onChange={(e) => setCat(e.target.value)} placeholder={t("links.categoryPlaceholder")} list="link-cats" />
        <datalist id="link-cats">
          {knownCats.map((c) => <option key={c} value={c} />)}
        </datalist>
        <button className="button-primary" onClick={add}>{t("common.add")}</button>
      </div>

      <div className="links-list">
        {Object.entries(byCat).map(([c, list]) => (
          <div key={c} className="links-cat">
            <h4>{c}</h4>
            <ul>
              {list.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                  <button
                    className="icon-button small"
                    onClick={() => remove(l.url)}
                    aria-label={t("common.delete")}
                  >✕</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
