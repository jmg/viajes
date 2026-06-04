import { useT } from "../i18n";

export type FilterId = "all" | "upcoming" | "in-progress" | "past";

type Props = {
  value: FilterId;
  counts: Record<FilterId, number>;
  onChange: (id: FilterId) => void;
};

const LABEL_KEYS: Record<FilterId, string> = {
  all: "filters.all",
  upcoming: "filters.upcoming",
  "in-progress": "filters.inProgress",
  past: "filters.past",
};

const ORDER: FilterId[] = ["all", "upcoming", "in-progress", "past"];

export function Filters({ value, counts, onChange }: Props) {
  const t = useT();
  return (
    <div className="filters">
      {ORDER.map((id) => (
        <button
          key={id}
          className={`filter-chip ${value === id ? "active" : ""}`}
          onClick={() => onChange(id)}
        >
          {t(LABEL_KEYS[id])} <span className="filter-count">{counts[id]}</span>
        </button>
      ))}
    </div>
  );
}
