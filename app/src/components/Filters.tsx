export type FilterId = "all" | "upcoming" | "in-progress" | "past";

type Props = {
  value: FilterId;
  counts: Record<FilterId, number>;
  onChange: (id: FilterId) => void;
};

const LABELS: Record<FilterId, string> = {
  all: "Todos",
  upcoming: "Próximos",
  "in-progress": "En curso",
  past: "Pasados",
};

const ORDER: FilterId[] = ["all", "upcoming", "in-progress", "past"];

export function Filters({ value, counts, onChange }: Props) {
  return (
    <div className="filters">
      {ORDER.map((id) => (
        <button
          key={id}
          className={`filter-chip ${value === id ? "active" : ""}`}
          onClick={() => onChange(id)}
        >
          {LABELS[id]} <span className="filter-count">{counts[id]}</span>
        </button>
      ))}
    </div>
  );
}
