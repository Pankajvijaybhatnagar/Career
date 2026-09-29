import {
  type Chart, type PlanetId, type PlanetPos, type DashaPeriod,
  SIGNS, SIGN_ELEMENT, SIGN_MODALITY, SIGN_LORD, aspectsHouse,
} from "./engine";
import { CAREER_FIELDS, PLANET_INFO, type CareerField, type Stream } from "./knowledge";

export type RankedField = CareerField & { score: number; percent: number; reasons: string[] };

export type Analysis = {
  lagnaSign: string;
  lagnaLord: PlanetId;
  moonSign: string;
  sunSign: string;
  dominantElement: string;
  modality: string;
  strongest: PlanetPos[];
  weakest: PlanetPos[];
  rankedFields: RankedField[];
  topFields: RankedField[];
  lowFields: RankedField[];
  streamScores: { stream: Stream; score: number }[];
  recommendedStream: Stream;
  tenth: { sign: string; lord: PlanetId; lordHouse: number; lordSign: string; occupants: PlanetId[]; aspectedBy: PlanetId[] };
  fifth: { sign: string; lord: PlanetId; lordHouse: number; occupants: PlanetId[] };
  fourth: { sign: string; lord: PlanetId; lordHouse: number; occupants: PlanetId[] };
  ninth: { sign: string; lord: PlanetId; lordHouse: number; occupants: PlanetId[] };
  learningStyle: { title: string; text: string; tips: string[] };
  educationScore: number; // 0..100
  currentDasha?: DashaPeriod;
  subPeriods: { maha: PlanetId; antar: PlanetId; start: string; end: string }[];
};

const P = (c: Chart, id: PlanetId) => c.planets.find((p) => p.id === id)!;

function houseInfo(c: Chart, n: number) {
  const h = c.houses[n - 1];
  return { sign: SIGNS[h.sign], lord: h.lord, lordHouse: P(c, h.lord).house, lordSign: SIGNS[P(c, h.lord).sign], occupants: h.occupants };
}

export function antardashas(maha: DashaPeriod) {
  const order: PlanetId[] = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const yrs: Record<PlanetId, number> = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
  const out: { maha: PlanetId; antar: PlanetId; start: string; end: string }[] = [];
  // The nominal start of the mahadasha, used for the first (partial) period after birth.
  const endMs = new Date(maha.end).getTime();
  let cursor = endMs - maha.years * 365.2425 * 86400000;
  const actualStart = new Date(maha.start).getTime();
  const idx = order.indexOf(maha.lord);
  for (let i = 0; i < 9; i++) {
    const lord = order[(idx + i) % 9];
    const len = (maha.years * yrs[lord]) / 120 * 365.2425 * 86400000;
    const end = cursor + len;
    if (end > actualStart) {
      out.push({ maha: maha.lord, antar: lord, start: new Date(Math.max(cursor, actualStart)).toISOString().slice(0, 10), end: new Date(end).toISOString().slice(0, 10) });
    }
    cursor = end;
  }
  return out;
}

export function analyse(c: Chart, now = new Date()): Analysis {
  const lagna = c.ascendant.sign;
  const lagnaLord = SIGN_LORD[lagna];
  const sorted = [...c.planets].sort((a, b) => b.strength - a.strength);

  // Score each career field.
  const tenthLord = c.houses[9].lord;
  const raw = CAREER_FIELDS.map((f) => {
    let score = 0;
    const reasons: string[] = [];
    for (const [pid, w] of Object.entries(f.weights) as [PlanetId, number][]) {
      const p = P(c, pid);
      const base = Math.max(p.strength + 4, 0.5); // shift so weak planets still count a little
      score += base * w;
      if (p.house === 10) { score += 6 * w; reasons.push(`${pid} sits in the 10th house of career`); }
      if (pid === tenthLord) { score += 5 * w; reasons.push(`${pid} rules the 10th house of career`); }
      if (aspectsHouse(p, 10)) score += 1.5 * w;
      if (p.dignity === "Exalted" || p.dignity === "Own sign") reasons.push(`${pid} is strong (${p.dignity.toLowerCase()} in ${SIGNS[p.sign]})`);
      if (f.houses.includes(p.house) && w >= 2) { score += 2 * w; reasons.push(`${pid} placed in the supportive ${p.house}th house`); }
    }
    // Normalise so fields with more (or heavier) planet weights are not favoured.
    const totalWeight = Object.values(f.weights).reduce((x, y) => x + (y ?? 0), 0);
    return { ...f, score: score / Math.pow(totalWeight, 0.7), reasons: [...new Set(reasons)].slice(0, 4) };
  });
  const max = Math.max(...raw.map((r) => r.score));
  const min = Math.min(...raw.map((r) => r.score));
  const ranked: RankedField[] = raw
    .map((r) => ({ ...r, percent: Math.round(45 + ((r.score - min) / (max - min || 1)) * 50) }))
    .sort((a, b) => b.score - a.score);

  // Streams: weighted by the top 6 fields.
  const streamMap = new Map<Stream, number>();
  ranked.slice(0, 6).forEach((f, i) => {
    f.stream.forEach((s, j) => streamMap.set(s, (streamMap.get(s) || 0) + (6 - i) * (j === 0 ? 1 : 0.6)));
  });
  const streamScores = [...streamMap.entries()]
    .filter(([s]) => s !== "Any stream")
    .map(([stream, score]) => ({ stream, score: Math.round(score * 10) / 10 }))
    .sort((a, b) => b.score - a.score);

  const elements = Object.entries(c.elementBalance).sort((a, b) => b[1] - a[1]);
  const mercury = P(c, "Mercury");
  const merEl = SIGN_ELEMENT[mercury.sign % 4];
  const styles: Record<string, { title: string; text: string; tips: string[] }> = {
    Fire: { title: "Active & Competitive Learner", text: "Learns best through challenges, competitions and hands-on activity. Gets bored with long, passive lectures.", tips: ["Use timers and mini-tests", "Reward milestones", "Study in short bursts with physical breaks"] },
    Earth: { title: "Practical & Step-by-step Learner", text: "Learns best through structured routines, real-life examples and repetition. Prefers depth over speed.", tips: ["Fixed timetable", "Practical examples and experiments", "Written notes and revision charts"] },
    Air: { title: "Logical & Social Learner", text: "Learns best by discussing, questioning and connecting ideas. Enjoys debates, group study and reading.", tips: ["Group discussions", "Teach-back method (child explains to parent)", "Mind maps and flow charts"] },
    Water: { title: "Intuitive & Visual Learner", text: "Learns best when emotionally connected to the subject and in a calm environment. Remembers pictures and stories.", tips: ["Stories and visuals", "Calm, quiet study space", "Encouragement over pressure"] },
  };

  const eduPlanets = [P(c, "Mercury"), P(c, "Jupiter"), P(c, c.houses[4].lord), P(c, c.houses[3].lord)];
  const eduRaw = eduPlanets.reduce((s, p) => s + p.strength, 0) / eduPlanets.length;
  const educationScore = Math.max(35, Math.min(96, Math.round(60 + eduRaw * 4)));

  const today = now.toISOString().slice(0, 10);
  const currentDasha = c.dashas.find((d) => d.start <= today && d.end > today) ?? c.dashas[0];
  const cdIdx = c.dashas.indexOf(currentDasha);
  const horizon = new Date(now.getTime() + 12 * 365 * 86400000).toISOString().slice(0, 10);
  const subPeriods = [currentDasha, c.dashas[cdIdx + 1]]
    .filter(Boolean)
    .flatMap((d) => antardashas(d!))
    .filter((a) => a.end > today && a.start < horizon);

  const tenth = houseInfo(c, 10);
  return {
    lagnaSign: SIGNS[lagna],
    lagnaLord,
    moonSign: SIGNS[P(c, "Moon").sign],
    sunSign: SIGNS[P(c, "Sun").sign],
    dominantElement: elements[0][0],
    modality: SIGN_MODALITY[lagna % 3],
    strongest: sorted.slice(0, 3),
    weakest: sorted.slice(-3).reverse(),
    rankedFields: ranked,
    topFields: ranked.slice(0, 5),
    lowFields: ranked.slice(-3).reverse(),
    streamScores,
    recommendedStream: streamScores[0]?.stream ?? "Any stream",
    tenth: { ...tenth, aspectedBy: c.planets.filter((p) => aspectsHouse(p, 10)).map((p) => p.id) },
    fifth: houseInfo(c, 5),
    fourth: houseInfo(c, 4),
    ninth: houseInfo(c, 9),
    learningStyle: styles[merEl],
    educationScore,
    currentDasha,
    subPeriods,
  };
}

export { PLANET_INFO };
