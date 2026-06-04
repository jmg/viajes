import { useEffect, useState } from "react";
import type { ChecklistItem } from "../../types";
import { useT } from "../../i18n";

type Props = {
  tripId: string;
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
};

export function ChecklistEditor({ tripId, items, onChange }: Props) {
  const t = useT();
  const storageKey = `checklist:${tripId}`;
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "{}"); } catch { return {}; }
  });
  const [draft, setDraft] = useState("");
  const [draftCat, setDraftCat] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const toggle = (label: string) => setChecked((c) => ({ ...c, [label]: !c[label] }));

  const add = () => {
    const label = draft.trim();
    if (!label) return;
    onChange([...items, { label, category: draftCat.trim() || undefined }]);
    setDraft("");
  };

  const remove = (label: string) => {
    onChange(items.filter((i) => i.label !== label));
    const next = { ...checked };
    delete next[label];
    setChecked(next);
  };

  const byCategory = items.reduce<Record<string, ChecklistItem[]>>((acc, i) => {
    const cat = i.category ?? t("checklist.general");
    (acc[cat] ??= []).push(i);
    return acc;
  }, {});

  const done = items.filter((i) => checked[i.label]).length;
  const knownCats = Array.from(new Set(items.map((i) => i.category).filter(Boolean) as string[]));

  return (
    <div className="checklist">
      {items.length > 0 && (
        <div className="checklist-progress">
          {t("checklist.completed", { done, total: items.length })}
        </div>
      )}

      <div className="checklist-add">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={t("checklist.newItemPlaceholder")}
        />
        <input
          type="text"
          list="cats"
          value={draftCat}
          onChange={(e) => setDraftCat(e.target.value)}
          placeholder={t("checklist.categoryPlaceholder")}
          className="cat-input"
        />
        <datalist id="cats">
          {knownCats.map((c) => <option key={c} value={c} />)}
        </datalist>
        <button className="button-primary" onClick={add}>{t("common.add")}</button>
      </div>

      {Object.entries(byCategory).map(([cat, list]) => (
        <div key={cat} className="checklist-cat">
          <h4>{cat}</h4>
          <ul>
            {list.map((i) => (
              <li key={i.label}>
                <label className={checked[i.label] ? "done" : ""}>
                  <input
                    type="checkbox"
                    checked={!!checked[i.label]}
                    onChange={() => toggle(i.label)}
                  />
                  <span>{i.label}</span>
                </label>
                <button
                  className="icon-button small"
                  onClick={() => remove(i.label)}
                  aria-label={t("common.delete")}
                  title={t("common.delete")}
                >✕</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
