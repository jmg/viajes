import { useMemo, useRef, useState } from "react";
import { DESTINATIONS } from "../destinations/data";
import { findDestination } from "../destinations/match";
import { useT } from "../i18n";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

const MAX_SUGGESTIONS = 8;

// Selector de destinos: chips para lo ya elegido + autocompletado sobre el
// catálogo. Permite también agregar lugares libres (no listados). Elegir del
// catálogo garantiza que el destino tenga coordenadas → el pronóstico funciona.
export function DestinationPicker({ value, onChange, placeholder }: Props) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const chosen = new Set(value.map((v) => v.toLowerCase()));
    return DESTINATIONS
      .filter((d) => !chosen.has(d.name.toLowerCase()))
      .filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q),
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [query, value]);

  const queryIsNew = query.trim().length > 0 &&
    !value.some((v) => v.toLowerCase() === query.trim().toLowerCase()) &&
    !suggestions.some((s) => s.name.toLowerCase() === query.trim().toLowerCase());

  const add = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    if (!value.some((v) => v.toLowerCase() === clean.toLowerCase())) {
      onChange([...value, clean]);
    }
    setQuery("");
    setActiveIdx(0);
    inputRef.current?.focus();
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[activeIdx]) add(suggestions[activeIdx].name);
      else if (query.trim()) add(query);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Backspace" && !query && value.length) {
      removeAt(value.length - 1);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="dest-picker">
      <div className="dest-chips" onClick={() => inputRef.current?.focus()}>
        {value.map((name, i) => {
          const match = findDestination(name);
          return (
            <span key={`${name}-${i}`} className="dest-chip">
              <span className="dest-chip-flag">{match?.flag ?? "📍"}</span>
              <span className="dest-chip-name">{name}</span>
              <button
                type="button"
                className="dest-chip-x"
                onClick={(e) => { e.stopPropagation(); removeAt(i); }}
                aria-label={t("picker.removeAria", { name })}
              >✕</button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          className="dest-picker-input"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIdx(0); }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={value.length ? t("picker.addAnother") : (placeholder ?? t("picker.searchPlaceholder"))}
        />
      </div>

      {open && (suggestions.length > 0 || queryIsNew) && (
        <ul className="dest-suggestions">
          {suggestions.map((d, i) => (
            <li key={d.id}>
              <button
                type="button"
                className={`dest-suggestion ${i === activeIdx ? "active" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(d.name)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                <span className="dest-suggestion-flag">{d.flag}</span>
                <span className="dest-suggestion-name">{d.name}</span>
                <span className="dest-suggestion-meta">{d.country}</span>
              </button>
            </li>
          ))}
          {queryIsNew && (
            <li>
              <button
                type="button"
                className="dest-suggestion dest-suggestion-custom"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(query)}
              >
                {t("picker.addCustom", { name: query.trim() })}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
