import { PLANET_HI, SIGNS, fmtDeg, type Chart } from "@/lib/astro/engine";

const DIGNITY_BADGE: Record<string, string> = {
  Exalted: "badge-paid", "Own sign": "badge-paid", Friendly: "badge-info", Neutral: "badge-free", Enemy: "badge-pending", Debilitated: "badge-danger",
};

export default function PlanetTable({ chart, compact = false }: { chart: Chart; compact?: boolean }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Planet</th><th>Sign</th><th>Degree</th><th>House</th>
            {!compact && <th>Nakshatra</th>}
            <th>Dignity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Lagna</b></td><td>{SIGNS[chart.ascendant.sign]}</td><td>{fmtDeg(chart.ascendant.degree)}</td><td>1</td>
            {!compact && <td>{chart.ascendant.nakshatra}</td>}<td>—</td>
          </tr>
          {chart.planets.map((p) => (
            <tr key={p.id}>
              <td>
                <b>{p.id}</b> <span className="muted small">({PLANET_HI[p.id]})</span>
                {p.retrograde && !["Rahu", "Ketu"].includes(p.id) && <span className="badge badge-pending" style={{ marginLeft: 6 }}>R</span>}
                {p.combust && <span className="badge badge-danger" style={{ marginLeft: 6 }}>Combust</span>}
              </td>
              <td>{SIGNS[p.sign]}</td>
              <td>{fmtDeg(p.degree)}</td>
              <td>{p.house}</td>
              {!compact && <td>{p.nakshatra} ({p.pada})</td>}
              <td><span className={`badge ${DIGNITY_BADGE[p.dignity]}`}>{p.dignity}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
