/**
 * Vedic (sidereal, Lahiri ayanamsa) chart engine.
 * Uses standard astronomical approximations (Meeus + JPL Keplerian elements),
 * accurate to well under a degree for 1900–2050. That is sufficient for sign,
 * house and nakshatra placement.
 */

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
export const SIGNS_HI = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
] as const;
export const SIGN_ELEMENT = ["Fire", "Earth", "Air", "Water"] as const;
export const SIGN_MODALITY = ["Movable", "Fixed", "Dual"] as const;

export type PlanetId = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";
export const PLANETS: PlanetId[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
export const PLANET_HI: Record<PlanetId, string> = {
  Sun: "Surya", Moon: "Chandra", Mars: "Mangal", Mercury: "Budh", Jupiter: "Guru",
  Venus: "Shukra", Saturn: "Shani", Rahu: "Rahu", Ketu: "Ketu",
};
export const PLANET_ABBR: Record<PlanetId, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};

export const SIGN_LORD: PlanetId[] = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
const EXALT: Partial<Record<PlanetId, number>> = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 1, Ketu: 7 };
const OWN: Partial<Record<PlanetId, number[]>> = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };
const FRIENDS: Record<PlanetId, PlanetId[]> = {
  Sun: ["Moon", "Mars", "Jupiter"], Moon: ["Sun", "Mercury"], Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"], Jupiter: ["Sun", "Moon", "Mars"], Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"], Rahu: ["Mercury", "Venus", "Saturn"], Ketu: ["Mars", "Jupiter"],
};
const ENEMIES: Record<PlanetId, PlanetId[]> = {
  Sun: ["Venus", "Saturn"], Moon: [], Mars: ["Mercury"], Mercury: ["Moon"], Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon"], Saturn: ["Sun", "Moon", "Mars"], Rahu: ["Sun", "Moon"], Ketu: ["Venus", "Moon"],
};

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
const DASHA_ORDER: PlanetId[] = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS: Record<PlanetId, number> = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };

export type Dignity = "Exalted" | "Own sign" | "Friendly" | "Neutral" | "Enemy" | "Debilitated";

export type PlanetPos = {
  id: PlanetId;
  longitude: number; // sidereal 0..360
  sign: number; // 0..11
  degree: number; // within sign
  house: number; // 1..12 whole-sign from lagna
  nakshatra: string;
  pada: number;
  retrograde: boolean;
  combust: boolean;
  dignity: Dignity;
  strength: number; // heuristic score, roughly -6..+14
};

export type DashaPeriod = { lord: PlanetId; start: string; end: string; years: number };

export type Chart = {
  input: { date: string; time: string; lat: number; lon: number; tz: number };
  jd: number;
  ayanamsa: number;
  ascendant: { longitude: number; sign: number; degree: number; nakshatra: string };
  midheaven: number;
  planets: PlanetPos[];
  houses: { house: number; sign: number; lord: PlanetId; occupants: PlanetId[] }[];
  moonNakshatra: { name: string; index: number; pada: number; lord: PlanetId };
  dashas: DashaPeriod[];
  tithiPhase: "Waxing" | "Waning";
  elementBalance: Record<string, number>;
};

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
export const norm = (d: number) => ((d % 360) + 360) % 360;

export function julianDay(date: string, time: string, tz: number) {
  const [Y, Mo, D] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  let y = Y, m = Mo;
  const dayFrac = D + (h + mi / 60 - tz) / 24;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFrac + B - 1524.5;
}

export function jdToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

export function lahiriAyanamsa(T: number) {
  return 23.85306 + 1.39697 * T + 0.0003086 * T * T;
}

function sunTropical(T: number) {
  const L0 = 280.46646 + 36000.76983 * T;
  const M = rad(357.52911 + 35999.05029 * T);
  const C = (1.914602 - 0.004817 * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
  return norm(L0 + C);
}

function moonTropical(T: number) {
  const Lp = 218.3164477 + 481267.88123421 * T;
  const D = rad(297.8501921 + 445267.1114034 * T);
  const M = rad(357.5291092 + 35999.0502909 * T);
  const Mp = rad(134.9633964 + 477198.8675055 * T);
  const F = rad(93.272095 + 483202.0175233 * T);
  const s = Math.sin;
  const lon =
    Lp + 6.288774 * s(Mp) + 1.274027 * s(2 * D - Mp) + 0.658314 * s(2 * D) + 0.213618 * s(2 * Mp)
    - 0.185116 * s(M) - 0.114332 * s(2 * F) + 0.058793 * s(2 * D - 2 * Mp) + 0.057066 * s(2 * D - M - Mp)
    + 0.053322 * s(2 * D + Mp) + 0.045758 * s(2 * D - M) - 0.040923 * s(M - Mp) - 0.03472 * s(D)
    - 0.030383 * s(M + Mp) + 0.015327 * s(2 * D - 2 * F) - 0.012528 * s(Mp + 2 * F) + 0.01098 * s(Mp - 2 * F)
    + 0.010675 * s(4 * D - Mp) + 0.010034 * s(3 * Mp) + 0.008548 * s(4 * D - 2 * Mp) - 0.007888 * s(2 * D + M - Mp)
    - 0.006766 * s(2 * D + M) - 0.005163 * s(D - Mp) + 0.004987 * s(D + M) + 0.004036 * s(2 * D - M + Mp);
  return norm(lon);
}

// JPL approximate Keplerian elements (J2000 ecliptic), [value, rate per century]
type El = [number, number];
const ELEMENTS: Record<string, { a: El; e: El; I: El; L: El; w: El; O: El }> = {
  Mercury: { a: [0.38709927, 0.00000037], e: [0.20563593, 0.00001906], I: [7.00497902, -0.00594749], L: [252.2503235, 149472.67411175], w: [77.45779628, 0.16047689], O: [48.33076593, -0.12534081] },
  Venus: { a: [0.72333566, 0.0000039], e: [0.00677672, -0.00004107], I: [3.39467605, -0.0007889], L: [181.9790995, 58517.81538729], w: [131.60246718, 0.00268329], O: [76.67984255, -0.27769418] },
  Earth: { a: [1.00000261, 0.00000562], e: [0.01671123, -0.00004392], I: [-0.00001531, -0.01294668], L: [100.46457166, 35999.37244981], w: [102.93768193, 0.32327364], O: [0, 0] },
  Mars: { a: [1.52371034, 0.00001847], e: [0.0933941, 0.00007882], I: [1.84969142, -0.00813131], L: [-4.55343205, 19140.30268499], w: [-23.94362959, 0.44441088], O: [49.55953891, -0.29257343] },
  Jupiter: { a: [5.202887, -0.00011607], e: [0.04838624, -0.00013253], I: [1.30439695, -0.00183714], L: [34.39644051, 3034.74612775], w: [14.72847983, 0.21252668], O: [100.47390909, 0.20469106] },
  Saturn: { a: [9.53667594, -0.0012506], e: [0.05386179, -0.00050991], I: [2.48599187, 0.00193609], L: [49.95424423, 1222.49362201], w: [92.59887831, -0.41897216], O: [113.66242448, -0.28867794] },
};

function helio(name: string, T: number) {
  const el = ELEMENTS[name];
  const v = (x: El) => x[0] + x[1] * T;
  const a = v(el.a), e = v(el.e), I = rad(v(el.I)), L = v(el.L), wBar = v(el.w), O = v(el.O);
  const w = rad(wBar - O);
  const Om = rad(O);
  let M = rad(norm(L - wBar));
  if (M > Math.PI) M -= 2 * Math.PI;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 10; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(Om), sO = Math.sin(Om), cI = Math.cos(I), sI = Math.sin(I);
  return {
    x: (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    y: (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    z: sw * sI * xp + cw * sI * yp,
  };
}

/** Geocentric ecliptic longitude referred to J2000 (a fixed frame, like the sidereal zodiac). */
function planetJ2000(name: string, T: number) {
  const p = helio(name, T);
  const e = helio("Earth", T);
  return norm(deg(Math.atan2(p.y - e.y, p.x - e.x)));
}

const AYAN_J2000 = lahiriAyanamsa(0);

function siderealLongitudes(jd: number) {
  const T = (jd - 2451545) / 36525;
  const ayan = lahiriAyanamsa(T);
  const node = norm(125.04452 - 1934.136261 * T);
  const out: Record<PlanetId, number> = {
    Sun: norm(sunTropical(T) - ayan),
    Moon: norm(moonTropical(T) - ayan),
    Mars: norm(planetJ2000("Mars", T) - AYAN_J2000),
    Mercury: norm(planetJ2000("Mercury", T) - AYAN_J2000),
    Jupiter: norm(planetJ2000("Jupiter", T) - AYAN_J2000),
    Venus: norm(planetJ2000("Venus", T) - AYAN_J2000),
    Saturn: norm(planetJ2000("Saturn", T) - AYAN_J2000),
    Rahu: norm(node - ayan),
    Ketu: norm(node + 180 - ayan),
  };
  return { lon: out, ayan, T };
}

function ascendant(jd: number, T: number, lat: number, lon: number) {
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T);
  const ramc = rad(norm(gmst + lon));
  const eps = rad(23.4392911 - 0.0130042 * T);
  const phi = rad(lat);
  const asc = norm(deg(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)))));
  const mc = norm(deg(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps))));
  return { asc, mc };
}

export function dignityOf(p: PlanetId, sign: number): Dignity {
  const ex = EXALT[p];
  if (ex !== undefined && ex === sign) return "Exalted";
  if (ex !== undefined && (ex + 6) % 12 === sign) return "Debilitated";
  if (OWN[p]?.includes(sign)) return "Own sign";
  const lord = SIGN_LORD[sign];
  if (FRIENDS[p].includes(lord)) return "Friendly";
  if (ENEMIES[p].includes(lord)) return "Enemy";
  return "Neutral";
}

const DIGNITY_SCORE: Record<Dignity, number> = { Exalted: 5, "Own sign": 4, Friendly: 2, Neutral: 0, Enemy: -2, Debilitated: -4 };

function houseScore(h: number) {
  if ([1, 4, 7, 10].includes(h)) return 3;
  if ([5, 9].includes(h)) return 3;
  if (h === 11) return 2;
  if (h === 2 || h === 3) return 1;
  return -2; // 6, 8, 12
}

function nakshatraOf(lon: number) {
  const size = 360 / 27;
  const index = Math.floor(lon / size);
  const pada = Math.floor((lon % size) / (size / 4)) + 1;
  return { index, name: NAKSHATRAS[index], pada, lord: DASHA_ORDER[index % 9] };
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function vimshottari(moonLon: number, birthJd: number): DashaPeriod[] {
  const size = 360 / 27;
  const nk = nakshatraOf(moonLon);
  const elapsed = (moonLon % size) / size;
  const startIdx = DASHA_ORDER.indexOf(nk.lord);
  const periods: DashaPeriod[] = [];
  const YEAR = 365.2425;
  // Start the first dasha "in the past" so it ends after the remaining balance.
  let cursor = birthJd - elapsed * DASHA_YEARS[nk.lord] * YEAR;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const yrs = DASHA_YEARS[lord];
    const end = cursor + yrs * YEAR;
    periods.push({ lord, start: isoDate(jdToDate(Math.max(cursor, birthJd))), end: isoDate(jdToDate(end)), years: yrs });
    cursor = end;
  }
  return periods;
}

/** Aspects in Vedic astrology: every planet aspects the 7th; Mars 4/8, Jupiter 5/9, Saturn 3/10, Rahu/Ketu 5/9. */
export function aspectsHouse(p: PlanetPos, house: number) {
  const dist = ((house - p.house + 12) % 12) + 1;
  if (dist === 7) return true;
  if (p.id === "Mars" && (dist === 4 || dist === 8)) return true;
  if ((p.id === "Jupiter" || p.id === "Rahu" || p.id === "Ketu") && (dist === 5 || dist === 9)) return true;
  if (p.id === "Saturn" && (dist === 3 || dist === 10)) return true;
  return false;
}

export function computeChart(date: string, time: string, lat: number, lon: number, tz: number): Chart {
  const jd = julianDay(date, time, tz);
  const { lon: L, ayan, T } = siderealLongitudes(jd);
  const { lon: L2 } = siderealLongitudes(jd + 1);
  const { asc, mc } = ascendant(jd, T, lat, lon);
  const ascSid = norm(asc - ayan);
  const lagnaSign = Math.floor(ascSid / 30);

  const planets: PlanetPos[] = PLANETS.map((id) => {
    const l = L[id];
    const sign = Math.floor(l / 30);
    const house = ((sign - lagnaSign + 12) % 12) + 1;
    const motion = ((L2[id] - l + 540) % 360) - 180;
    const retrograde = id === "Rahu" || id === "Ketu" ? true : motion < 0;
    const sunDist = Math.abs(((l - L.Sun + 540) % 360) - 180);
    const combust = !["Sun", "Moon", "Rahu", "Ketu"].includes(id) && sunDist < 8;
    const nk = nakshatraOf(l);
    const dignity = dignityOf(id, sign);
    return { id, longitude: l, sign, degree: l % 30, house, nakshatra: nk.name, pada: nk.pada, retrograde, combust, dignity, strength: 0 };
  });

  const houses = Array.from({ length: 12 }, (_, i) => {
    const sign = (lagnaSign + i) % 12;
    return { house: i + 1, sign, lord: SIGN_LORD[sign], occupants: planets.filter((p) => p.house === i + 1).map((p) => p.id) };
  });

  // Heuristic strength score (dignity + placement + special roles).
  const lagnaLord = houses[0].lord;
  const tenthLord = houses[9].lord;
  for (const p of planets) {
    let s = DIGNITY_SCORE[p.dignity] + houseScore(p.house);
    if (p.id === lagnaLord) s += 2;
    if (p.id === tenthLord) s += 3;
    if (p.house === 10) s += 3;
    if (aspectsHouse(p, 10)) s += 1.5;
    if (p.combust) s -= 2;
    if (p.retrograde && !["Rahu", "Ketu"].includes(p.id)) s += 1;
    p.strength = Math.round(s * 10) / 10;
  }

  const moon = planets.find((p) => p.id === "Moon")!;
  const moonNk = nakshatraOf(moon.longitude);
  const phase = norm(L.Moon - L.Sun) < 180 ? "Waxing" : "Waning";

  const elementBalance: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const weights: Partial<Record<PlanetId, number>> = { Sun: 2, Moon: 2, Mercury: 1, Venus: 1, Mars: 1, Jupiter: 1, Saturn: 1 };
  elementBalance[SIGN_ELEMENT[lagnaSign % 4]] += 3;
  for (const p of planets) if (weights[p.id]) elementBalance[SIGN_ELEMENT[p.sign % 4]] += weights[p.id]!;

  return {
    input: { date, time, lat, lon, tz },
    jd,
    ayanamsa: ayan,
    ascendant: { longitude: ascSid, sign: lagnaSign, degree: ascSid % 30, nakshatra: nakshatraOf(ascSid).name },
    midheaven: norm(mc - ayan),
    planets,
    houses,
    moonNakshatra: { name: moonNk.name, index: moonNk.index, pada: moonNk.pada, lord: moonNk.lord },
    dashas: vimshottari(moon.longitude, jd),
    tithiPhase: phase,
    elementBalance,
  };
}

export function fmtDeg(d: number) {
  const whole = Math.floor(d);
  const min = Math.floor((d - whole) * 60);
  return `${whole}°${String(min).padStart(2, "0")}'`;
}
