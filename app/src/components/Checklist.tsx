import { useEffect, useState } from "react";
import type { ChecklistItem } from "../types";

type Props = {
  tripId: string;
  items: ChecklistItem[];
};

export function Checklist({ tripId, items }: Props) {
  const storageKey = `checklist:${tripId}`;
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const toggle = (label: string) =>
    setChecked((c) => ({ ...c, [label]: !c[label] }));

  const byCategory = items.reduce<Record<string, ChecklistItem[]>>((acc, i) => {
    const cat = i.category ?? "General";
    (acc[cat] ??= []).push(i);
    return acc;
  }, {});

  const done = items.filter((i) => checked[i.label]).length;

  return (
    <div className="checklist">
      <div className="checklist-progress">
        {done} / {items.length} completados
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
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
