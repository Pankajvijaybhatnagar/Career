import { computeChart, SIGNS, NAKSHATRAS, type Chart, type PlanetId } from "./engine";

export const PRASHNA_CATEGORIES = {
  CAREER: { label: "Career / Profession", icon: "💼", house: 10 },
  EDUCATION: { label: "Studies / Admission", icon: "🎓", house: 4 },
  EXAM: { label: "Exam / Competition result", icon: "📝", house: 6 },
  HIGHER: { label: "Higher education / Stream choice", icon: "📚", house: 5 },
  ABROAD: { label: "Study or work abroad", icon: "✈️", house: 12 },
  GENERAL: { label: "General wellbeing", icon: "🌟", house: 1 },
} as const;
export type PrashnaCategory = keyof typeof PRASHNA_CATEGORIES;

const BENEFICS: PlanetId[] = ["Jupiter", "Venus", "Mercury", "Moon"];
const MALEFICS: PlanetId[] = ["Saturn", "Mars", "Rahu", "Ketu", "Sun"];

/** Current wall-clock date/time in a given UTC offset. */
export function nowInTz(tz: number, d = new Date()) {
  const local = new Date(d.getTime() + tz * 3600000);
  return {
    date: local.toISOString().slice(0, 10),
    time: local.toISOString().slice(11, 16),
  };
}

export function castPrashna(category: PrashnaCategory, lat: number, lon: number, tz: number, when = new Date()) {
  const { date, time } = nowInTz(tz, when);
  const chart = computeChart(date, time, lat, lon, tz);
  return { chart, reading: readPrashna(chart, category) };
}

export function readPrashna(chart: Chart, category: PrashnaCategory) {
  const cat = PRASHNA_CATEGORIES[category];
  const P = (id: PlanetId) => chart.planets.find((p) => p.id === id)!;
  const lagnaLord = P(chart.houses[0].lord);
  const karyaHouse = chart.houses[cat.house - 1];
  const karyaLord = P(karyaHouse.lord);
  const moon = P("Moon");
  const eleventh = chart.houses[10];

  let score = 0;
  const points: string[] = [];

  const good = (h: number) => [1, 4, 5, 7, 9, 10, 11].includes(h);
  if (good(lagnaLord.house)) { score += 2; points.push(`The Lagna lord ${lagnaLord.id} is well placed in house ${lagnaLord.house}, showing the querent has the strength to achieve the goal.`); }
  else { score -= 1; points.push(`The Lagna lord ${lagnaLord.id} is in house ${lagnaLord.house}, so extra effort and patience are needed.`); }

  if (good(karyaLord.house) && karyaLord.dignity !== "Debilitated") { score += 2; points.push(`The lord of the matter (house ${cat.house}), ${karyaLord.id}, is supportive in house ${karyaLord.house}.`); }
  else { score -= 1; points.push(`The lord of the matter (house ${cat.house}), ${karyaLord.id}, is under pressure in house ${karyaLord.house} (${karyaLord.dignity}).`); }

  if (good(moon.house)) { score += 1.5; points.push(`The Moon, the mind of the question, is in house ${moon.house}, which is encouraging.`); }
  else { score -= 1; points.push(`The Moon in house ${moon.house} shows worry or confusion around the question.`); }

  if (chart.tithiPhase === "Waxing") { score += 1; points.push("The Moon is waxing, so the matter tends to grow and improve."); }
  else points.push("The Moon is waning, so it is better to act with planning than in a hurry.");

  const inKarya = karyaHouse.occupants;
  const ben = inKarya.filter((p) => BENEFICS.includes(p));
  const mal = inKarya.filter((p) => MALEFICS.includes(p));
  if (ben.length) { score += 1.5 * ben.length; points.push(`Benefic ${ben.join(", ")} in the house of the matter bless the outcome.`); }
  if (mal.length) { score -= 1 * mal.length; points.push(`${mal.join(", ")} in the house of the matter bring delay or struggle.`); }

  if (eleventh.occupants.some((p) => BENEFICS.includes(p))) { score += 1; points.push("Benefics in the 11th house of gains support fulfilment of the wish."); }
  if (P("Jupiter").house === 1 || P("Jupiter").house === cat.house) { score += 1.5; points.push("Jupiter's direct involvement is a strong sign of guidance and success."); }

  const verdict = score >= 4 ? "Favourable" : score >= 1 ? "Mixed – success with effort" : "Needs patience – delays indicated";
  const summary =
    score >= 4
      ? "The Prashna chart is supportive. With steady effort, the outcome is likely to be positive."
      : score >= 1
        ? "The chart shows a mixed picture. Results are possible but depend on consistent effort and correct timing."
        : "The chart shows obstacles at present. Focus on preparation and remedies; a better time is likely to come.";

  return {
    verdict,
    score: Math.round(score * 10) / 10,
    lagna: SIGNS[chart.ascendant.sign],
    moonNakshatra: NAKSHATRAS[chart.moonNakshatra.index],
    summary,
    points,
  };
}

export type PrashnaReading = ReturnType<typeof readPrashna>;
