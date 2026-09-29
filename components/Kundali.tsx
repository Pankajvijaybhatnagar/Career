import { PLANET_ABBR, SIGNS, fmtDeg, type Chart } from "@/lib/astro/engine";

// North Indian chart: houses are fixed, signs rotate. [label x, label y, sign-number x, sign-number y]
const POS: Record<number, [number, number, number, number]> = {
  1: [200, 105, 200, 178], 2: [100, 45, 100, 76], 3: [45, 105, 76, 100], 4: [105, 200, 178, 200],
  5: [45, 300, 76, 300], 6: [100, 358, 100, 324], 7: [200, 295, 200, 222], 8: [300, 358, 300, 324],
  9: [355, 300, 324, 300], 10: [295, 200, 222, 200], 11: [355, 105, 324, 100], 12: [300, 45, 300, 76],
};

export default function Kundali({ chart, title = "Lagna Kundali", moonChart = false }: { chart: Chart; title?: string; moonChart?: boolean }) {
  const lagnaSign = moonChart ? chart.planets.find((p) => p.id === "Moon")!.sign : chart.ascendant.sign;
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox="0 0 400 400" className="kundali" role="img" aria-label={`${title}: ${SIGNS[lagnaSign]} ascendant`}>
        <rect x="2" y="2" width="396" height="396" rx="6" className="frame" />
        <line x1="2" y1="2" x2="398" y2="398" className="ln" />
        <line x1="398" y1="2" x2="2" y2="398" className="ln" />
        <polygon points="200,2 398,200 200,398 2,200" fill="none" className="ln" />
        {Array.from({ length: 12 }, (_, i) => {
          const house = i + 1;
          const sign = (lagnaSign + i) % 12;
          const [lx, ly, sx, sy] = POS[house];
          const occupants = chart.planets.filter((p) => p.sign === sign);
          return (
            <g key={house}>
              <text x={sx} y={sy} textAnchor="middle" dominantBaseline="middle" className="signno">{sign + 1}</text>
              {house === 1 && <text x={lx} y={ly - 32} textAnchor="middle" className="asc">{moonChart ? "Moon" : "Asc"}</text>}
              {occupants.map((p, j) => (
                <text
                  key={p.id}
                  x={lx + (j % 2 === 0 ? -1 : 1) * (occupants.length > 1 ? 16 : 0)}
                  y={ly - 10 + Math.floor(j / 2) * 18}
                  textAnchor="middle"
                  className="pl"
                >
                  {PLANET_ABBR[p.id]}
                  {p.retrograde && !["Rahu", "Ketu"].includes(p.id) ? "*" : ""}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      <figcaption className="center small muted mt-1">
        {title} · Lagna {SIGNS[chart.ascendant.sign]} {fmtDeg(chart.ascendant.degree)} · * = retrograde
      </figcaption>
    </figure>
  );
}
