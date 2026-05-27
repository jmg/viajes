import type { LinkRef } from "../types";

type Props = { links: LinkRef[] };

export function LinksList({ links }: Props) {
  const byCat = links.reduce<Record<string, LinkRef[]>>((acc, l) => {
    const cat = l.category ?? "Links";
    (acc[cat] ??= []).push(l);
    return acc;
  }, {});

  return (
    <div className="links-list">
      {Object.entries(byCat).map(([cat, list]) => (
        <div key={cat} className="links-cat">
          <h4>{cat}</h4>
          <ul>
            {list.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
