"use client";
import Link from "next/link";
import Kundali from "./Kundali";
import PlanetTable from "./PlanetTable";
import { PHOTO_FIELDS, ageOf, type Student } from "@/lib/store";
import { planOf } from "@/lib/plans";
import { REPORT_PAGE_TITLES } from "@/lib/report-pages";
import { NAKSHATRAS, PLANET_HI, SIGNS, SIGN_ELEMENT, type Chart } from "@/lib/astro/engine";
import { HOUSE_MEANING, LAGNA_TEXT, MOON_TEXT, PLANET_INFO } from "@/lib/astro/knowledge";
import type { Analysis } from "@/lib/astro/interpret";
import UnlockButton from "./UnlockButton";

const SITE = process.env.NEXT_PUBLIC_SITE_NAME || "Vidya Jyotish";

type Ctx = { s: Student; chart: Chart; a: Analysis };

function Page({ n, children, cover }: { n: number; children: React.ReactNode; cover?: boolean }) {
  return (
    <section className={`rpage ${cover ? "cover" : ""}`} id={`page-${n}`}>
      {!cover && <div className="corner" />}
      {!cover && <h2>{REPORT_PAGE_TITLES[n - 1].icon} {REPORT_PAGE_TITLES[n - 1].title}</h2>}
      {children}
      <div className="pno"><span>{SITE} · Career Guidance Report</span><span>Page {n} of 22</span></div>
    </section>
  );
}

function Pending({ what }: { what: string }) {
  return (
    <div className="callout violet">
      ⏳ <b>Astrologer review in progress.</b> {what} will appear here once our astrologer completes the case study (usually within 3–5 working days).
    </div>
  );
}

const lines = (t?: string) => (t ? t.split(/\n+/).filter(Boolean).map((l, i) => <p key={i}>{l}</p>) : null);

// ---------------- the 22 pages ----------------
const PAGES: ((c: Ctx) => React.ReactNode)[] = [
  // 1 Cover
  ({ s, a }) => (
    <>
      <div style={{ fontSize: "4rem" }}>✦</div>
      <h3 style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: ".9rem" }}>{SITE}</h3>
      <h1 style={{ fontSize: "2.8rem" }}>Career Guidance Report</h1>
      <p style={{ color: "#d9d2ff" }}>Based on Vedic Astrology, Prashna Kundali, Palmistry & Face Reading</p>
      {s.photos.facePhoto && <img src={s.photos.facePhoto} alt="" style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: "5px solid #ffd23f", margin: "24px 0" }} />}
      <h2 style={{ fontSize: "2rem" }}>{s.fullName}</h2>
      <p style={{ color: "#d9d2ff" }}>{s.currentClass} · Born {s.dateOfBirth} · {s.birthPlace}</p>
      <p style={{ color: "#ffd23f", fontWeight: 700 }}>{a.lagnaSign} Lagna · {a.moonSign} Moon</p>
      <p className="small" style={{ color: "#cfc6ff", marginTop: 40 }}>Prepared on {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
    </>
  ),
  // 2 Letter
  ({ s }) => (
    <>
      <p>Dear Parents,</p>
      <p>
        Thank you for trusting us with {s.fullName}'s future. Every child is born with a unique combination of talents. In Vedic astrology, these are shown by the positions of the planets at the moment of birth.
      </p>
      <p>
        In countries like the USA, schools use aptitude and psychometric tests to guide students. This report takes a different, time-tested route: it studies your child's <b>Janma Kundali</b> (birth chart), <b>Prashna Kundali</b>, <b>palm lines</b> and <b>facial features</b> to understand their nature, learning style and natural career direction.
      </p>
      <div className="callout">
        <b>How to read this report</b>
        <ul>
          <li>Pages 3–6 describe the birth chart and the planets.</li>
          <li>Pages 7–10 explain personality, temperament and learning style.</li>
          <li>Pages 11–15 give the recommended stream and career fields.</li>
          <li>Pages 16–19 cover strengths, challenges and important time periods.</li>
          <li>Pages 20–22 contain the astrologer's palmistry, face-reading case study and your action plan.</li>
        </ul>
      </div>
      <p>
        <b>Parents are the main decision makers.</b> Please use this report together with your child's own interests, school marks and the teachers' opinions. Astrology shows tendencies and timing; hard work and your encouragement turn them into success.
      </p>
      <p>With blessings,<br /><b>The {SITE} Team</b></p>
    </>
  ),
  // 3 Profile
  ({ s, chart }) => (
    <>
      <div className="grid grid-2">
        <dl className="kv">
          <dt>Full name</dt><dd>{s.fullName}</dd>
          <dt>Gender</dt><dd>{s.gender === "MALE" ? "Boy" : s.gender === "FEMALE" ? "Girl" : "Other"}</dd>
          <dt>Age</dt><dd>{ageOf(s.dateOfBirth)} years</dd>
          <dt>Class</dt><dd>{s.currentClass}</dd>
          <dt>School</dt><dd>{s.schoolName || "—"}</dd>
          <dt>Favourite subjects</dt><dd>{s.favouriteSubjects || "—"}</dd>
          <dt>Hobbies</dt><dd>{s.hobbies || "—"}</dd>
        </dl>
        <dl className="kv">
          <dt>Date of birth</dt><dd>{s.dateOfBirth}</dd>
          <dt>Time of birth</dt><dd>{s.birthTimeAccuracy === "UNKNOWN" ? "Not known (noon used)" : `${s.timeOfBirth} (${s.birthTimeAccuracy.toLowerCase()})`}</dd>
          <dt>Place</dt><dd>{s.birthPlace}</dd>
          <dt>Coordinates</dt><dd>{s.latitude.toFixed(2)}°, {s.longitude.toFixed(2)}°</dd>
          <dt>Time zone</dt><dd>UTC {s.tzOffset >= 0 ? "+" : ""}{s.tzOffset}</dd>
          <dt>Ayanamsa</dt><dd>Lahiri {chart.ayanamsa.toFixed(2)}°</dd>
        </dl>
      </div>
      <h3>Parents' goals & concerns</h3>
      <p>{s.parentGoals || "Not provided."}</p>
      <h3>Achievements</h3>
      <p>{s.achievements || "Not provided."}</p>
      {s.birthTimeAccuracy !== "EXACT" && (
        <div className="callout">Because the birth time is {s.birthTimeAccuracy === "UNKNOWN" ? "not known" : "approximate"}, the Lagna and house positions may vary. The astrologer gives extra weight to the Moon chart, Prashna Kundali and palmistry.</div>
      )}
    </>
  ),
  // 4 Kundali
  ({ chart, a }) => (
    <>
      <p>The Lagna Kundali (North Indian style) shows the sky at the moment of birth. The number in each house is the zodiac sign; the letters are the planets.</p>
      <Kundali chart={chart} />
      <div className="grid grid-3 mt-2">
        <div className="card card-soft center"><div className="small muted">Lagna</div><b>{a.lagnaSign}</b><div className="small">{SIGNS_HI_OF(chart.ascendant.sign)}</div></div>
        <div className="card card-soft center"><div className="small muted">Rashi (Moon)</div><b>{a.moonSign}</b><div className="small">{NAKSHATRAS[chart.moonNakshatra.index]}</div></div>
        <div className="card card-soft center"><div className="small muted">Lagna lord</div><b>{a.lagnaLord}</b><div className="small">in house {chart.planets.find((p) => p.id === a.lagnaLord)!.house}</div></div>
      </div>
      <p className="small muted mt-2">Su Sun · Mo Moon · Ma Mars · Me Mercury · Ju Jupiter · Ve Venus · Sa Saturn · Ra Rahu · Ke Ketu</p>
    </>
  ),
  // 5 Planets
  ({ chart }) => (
    <>
      <p>Each planet's sign, house and dignity shows how strongly it can give results. Exalted and own-sign planets are strong; debilitated or combust planets need support through effort and remedies.</p>
      <PlanetTable chart={chart} />
      <h3>Houses at a glance</h3>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>House</th><th>Meaning</th><th>Sign</th><th>Lord</th><th>Planets</th></tr></thead>
          <tbody>
            {chart.houses.map((h) => (
              <tr key={h.house}><td>{h.house}</td><td className="small">{HOUSE_MEANING[h.house]}</td><td>{SIGNS[h.sign]}</td><td>{h.lord}</td><td>{h.occupants.join(", ") || "—"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ),
  // 6 Moon
  ({ chart, a }) => (
    <>
      <div className="grid grid-2" style={{ alignItems: "center" }}>
        <Kundali chart={chart} moonChart title="Chandra Kundali" />
        <div>
          <h3>Moon in {a.moonSign}</h3>
          <p>{MOON_TEXT[chart.planets.find((p) => p.id === "Moon")!.sign]}</p>
          <dl className="kv">
            <dt>Janma Nakshatra</dt><dd>{chart.moonNakshatra.name}</dd>
            <dt>Pada</dt><dd>{chart.moonNakshatra.pada}</dd>
            <dt>Nakshatra lord</dt><dd>{chart.moonNakshatra.lord}</dd>
            <dt>Moon phase at birth</dt><dd>{chart.tithiPhase}</dd>
          </dl>
        </div>
      </div>
      <div className="callout teal">
        The Moon represents the <b>mind</b>. A peaceful mind learns better. The nakshatra lord <b>{chart.moonNakshatra.lord}</b> starts the child's Vimshottari Dasha and colours their early years: {PLANET_INFO[chart.moonNakshatra.lord].karaka.toLowerCase()}.
      </div>
    </>
  ),
  // 7 Lagna personality
  ({ chart, a }) => {
    const lord = chart.planets.find((p) => p.id === a.lagnaLord)!;
    return (
      <>
        <p style={{ fontSize: "1.1rem" }}>{LAGNA_TEXT[chart.ascendant.sign]}</p>
        <h3>The Lagna lord {a.lagnaLord} in house {lord.house}</h3>
        <p>
          The ruler of the chart sits in the house of <b>{HOUSE_MEANING[lord.house].toLowerCase()}</b> and is <b>{lord.dignity.toLowerCase()}</b> in {SIGNS[lord.sign]}. This shows that the child's energy naturally flows into these areas of life.
        </p>
        <h3>Planets influencing the personality</h3>
        <ul>
          {chart.houses[0].occupants.length ? chart.houses[0].occupants.map((p) => (
            <li key={p}><b>{p}</b> in the Lagna: {PLANET_INFO[p].strengths.join(", ").toLowerCase()}.</li>
          )) : <li>No planets in the Lagna. The Lagna lord and aspects shape the personality.</li>}
        </ul>
        <div className="callout">Nature: <b>{a.modality}</b> sign ({a.modality === "Movable" ? "active, starts things quickly" : a.modality === "Fixed" ? "steady, determined, finishes what they start" : "flexible, adaptable, good at many things"}).</div>
      </>
    );
  },
  // 8 Temperament
  ({ chart, a }) => {
    const total = Object.values(chart.elementBalance).reduce((x, y) => x + y, 0);
    const desc: Record<string, string> = {
      Fire: "Energy, confidence, leadership, competitiveness",
      Earth: "Practicality, patience, discipline, reliability",
      Air: "Thinking, communication, social skills, ideas",
      Water: "Emotions, intuition, creativity, empathy",
    };
    return (
      <>
        <p>The balance of the four elements (Tattvas) across the Lagna, Sun, Moon and planets shows the child's basic temperament.</p>
        {SIGN_ELEMENT.map((el) => (
          <div key={el} className="meter">
            <span><b>{el}</b></span>
            <div className="progress"><span style={{ width: `${(chart.elementBalance[el] / total) * 100}%` }} /></div>
            <b>{Math.round((chart.elementBalance[el] / total) * 100)}%</b>
          </div>
        ))}
        <div className="grid grid-2 mt-2">
          {SIGN_ELEMENT.map((el) => <div key={el} className="card card-soft"><b>{el}</b><div className="small">{desc[el]}</div></div>)}
        </div>
        <div className="callout mt-2">
          Dominant element: <b>{a.dominantElement}</b>. {desc[a.dominantElement]}. Careers that use these qualities feel natural and satisfying for the child.
        </div>
      </>
    );
  },
  // 9 Learning style
  ({ chart, a }) => {
    const me = chart.planets.find((p) => p.id === "Mercury")!;
    return (
      <>
        <div className="grid grid-2">
          <div className="card card-soft center"><div className="small muted">Mercury (intellect)</div><b>{SIGNS[me.sign]} · house {me.house}</b><div className="small">{me.dignity}{me.combust ? ", combust" : ""}</div></div>
          <div className="card card-soft center"><div className="small muted">5th house (intelligence)</div><b>{a.fifth.sign}</b><div className="small">Lord {a.fifth.lord} in house {a.fifth.lordHouse}</div></div>
        </div>
        <h3>{a.learningStyle.title}</h3>
        <p>{a.learningStyle.text}</p>
        <h3>Study tips for parents</h3>
        <ul>{a.learningStyle.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        {a.fifth.occupants.length > 0 && <p>Planets in the 5th house ({a.fifth.occupants.join(", ")}) add their qualities to the child's intelligence and creativity.</p>}
        <div className="callout violet">Best study time: early morning for memory work, evening for practice. Study facing east or north.</div>
      </>
    );
  },
  // 10 Education
  ({ a }) => (
    <>
      <p>Education is seen from the 4th house (school education), the 5th house (intelligence) and the 9th house (higher studies and teachers), along with Mercury and Jupiter.</p>
      <div className="meter"><span><b>Education strength</b></span><div className="progress cool"><span style={{ width: `${a.educationScore}%` }} /></div><b>{a.educationScore}</b></div>
      <div className="table-wrap mt-2">
        <table className="table">
          <thead><tr><th>House</th><th>Sign</th><th>Lord & placement</th><th>Planets</th></tr></thead>
          <tbody>
            <tr><td>4th – School</td><td>{a.fourth.sign}</td><td>{a.fourth.lord} in {a.fourth.lordHouse}</td><td>{a.fourth.occupants.join(", ") || "—"}</td></tr>
            <tr><td>5th – Intelligence</td><td>{a.fifth.sign}</td><td>{a.fifth.lord} in {a.fifth.lordHouse}</td><td>{a.fifth.occupants.join(", ") || "—"}</td></tr>
            <tr><td>9th – Higher studies</td><td>{a.ninth.sign}</td><td>{a.ninth.lord} in {a.ninth.lordHouse}</td><td>{a.ninth.occupants.join(", ") || "—"}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="callout mt-2">
        {a.educationScore >= 75
          ? "Education yogas are strong. The child can aim for competitive exams and top institutions with steady effort."
          : a.educationScore >= 55
            ? "Education indicators are good. Consistent routine and the right guidance will bring good results."
            : "Education needs extra support. Patient teaching, a tutor or mentor, and the remedies on page 22 are recommended."}
      </div>
      {[a.fourth, a.fifth, a.ninth].some((h) => [6, 8, 12].includes(h.lordHouse)) && (
        <p className="small">Note: one of the education lords sits in a challenging house (6/8/12). This can bring breaks, a change of subject or a need for extra effort at some point. It is not a barrier to success.</p>
      )}
    </>
  ),
  // 11 Stream
  ({ s, a }) => (
    <>
      <p>Based on the top career fields and the planets that support them, this is how the chart points to the subject stream after Class 10:</p>
      {a.streamScores.map((st, i) => (
        <div key={st.stream} className="meter">
          <span><b>{i === 0 ? "⭐ " : ""}{st.stream}</b></span>
          <div className="progress"><span style={{ width: `${(st.score / a.streamScores[0].score) * 100}%` }} /></div>
          <b>{Math.round((st.score / a.streamScores[0].score) * 100)}</b>
        </div>
      ))}
      <div className="callout mt-2" style={{ fontSize: "1.1rem" }}>
        Recommended stream: <b>{s.caseStudy?.recommendedStream || a.recommendedStream}</b>
        {s.caseStudy?.recommendedStream && <div className="small">(confirmed by the astrologer after the case study)</div>}
      </div>
      <h3>Why this stream?</h3>
      <ul>{a.topFields.slice(0, 3).map((f) => <li key={f.id}><b>{f.name}</b> ranks high and is reached mainly through {f.stream.join(" / ")}.</li>)}</ul>
      <p className="small muted">Also consider the child's marks and interest in the core subjects. If they strongly dislike a subject, discuss it in the counselling session.</p>
    </>
  ),
  // 12 10th house
  ({ chart, a }) => (
    <>
      <p>The 10th house (Karma Bhava) is the main house of career and reputation. Its sign, its lord, the planets in it and the planets aspecting it show the kind of work the child will enjoy and succeed in.</p>
      <div className="grid grid-2">
        <div className="card card-soft"><div className="small muted">10th house sign</div><b style={{ fontSize: "1.3rem" }}>{a.tenth.sign}</b></div>
        <div className="card card-soft"><div className="small muted">10th lord</div><b style={{ fontSize: "1.3rem" }}>{a.tenth.lord} in house {a.tenth.lordHouse}</b><div className="small">({a.tenth.lordSign})</div></div>
      </div>
      <h3>Planets in the 10th house</h3>
      <p>{a.tenth.occupants.length ? a.tenth.occupants.map((p) => `${p} (${PLANET_INFO[p].karaka.toLowerCase()})`).join("; ") : "No planets sit in the 10th house, so the 10th lord becomes the main career indicator."}</p>
      <h3>Planets aspecting the 10th house</h3>
      <p>{a.tenth.aspectedBy.length ? a.tenth.aspectedBy.join(", ") : "None"}</p>
      <div className="callout">
        The 10th lord {a.tenth.lord} placed in the house of <b>{HOUSE_MEANING[a.tenth.lordHouse].toLowerCase()}</b> links the career with these themes. {PLANET_INFO[a.tenth.lord].karaka} are the keywords for {a.tenth.lord}.
      </div>
      <p className="small muted">Midheaven (MC) degree: {SIGNS[Math.floor(chart.midheaven / 30)]} {(chart.midheaven % 30).toFixed(1)}°</p>
    </>
  ),
  // 13 ranked
  ({ a }) => (
    <>
      <p>All 16 career families were scored from planet strength, the 10th house, supportive houses and aspects. Higher means a more natural fit.</p>
      {a.rankedFields.map((f, i) => (
        <div key={f.id} className="meter">
          <span className="small">{i < 5 ? "⭐ " : ""}{f.icon} {f.name}</span>
          <div className={`progress ${i < 5 ? "" : "cool"}`}><span style={{ width: `${f.percent}%` }} /></div>
          <b>{f.percent}%</b>
        </div>
      ))}
    </>
  ),
  // 14 top detail
  ({ a }) => (
    <>
      {a.topFields.slice(0, 3).map((f, i) => (
        <div key={f.id} className="card mb-2">
          <div className="flex between"><h3 className="mt-0 mb-0">{i + 1}. {f.icon} {f.name}</h3><span className="badge badge-paid">{f.percent}% match</span></div>
          <p className="small mt-1">{f.description}</p>
          <div className="small"><b>Careers:</b> {f.careers.join(", ")}</div>
          <div className="small"><b>Courses:</b> {f.courses.join(", ")}</div>
          <div className="small"><b>Skills to build:</b> {f.skills.join(", ")}</div>
          {f.reasons.length > 0 && <div className="small muted mt-1"><b>Astrological reasons:</b> {f.reasons.join("; ")}.</div>}
        </div>
      ))}
      <p className="small"><b>Also suitable:</b> {a.topFields.slice(3).map((f) => f.name).join(", ")}</p>
    </>
  ),
  // 15 low
  ({ a }) => (
    <>
      <p>These fields show the <b>lowest natural support</b> in the chart. This does not mean failure, only that success would need much more effort and interest from the child.</p>
      {a.lowFields.map((f) => (
        <div key={f.id} className="card card-soft mb-2">
          <b>{f.icon} {f.name}</b> <span className="badge badge-pending">{f.percent}%</span>
          <p className="small mb-0 mt-1">Main planets for this field ({Object.keys(f.weights).slice(0, 3).join(", ")}) are relatively weaker in this chart.</p>
        </div>
      ))}
      <div className="callout">
        🚦 If the child shows a strong, lasting passion for one of these fields, respect it. Passion plus effort can overcome planetary weakness. The remedies for the weaker planets on page 22 will help.
      </div>
    </>
  ),
  // 16 strengths
  ({ a }) => (
    <>
      <p>The three strongest planets in the chart are the child's natural gifts. Build on them.</p>
      {a.strongest.map((p) => (
        <div key={p.id} className="card mb-2">
          <h3 className="mt-0">💪 {p.id} ({PLANET_HI[p.id]})</h3>
          <p className="small muted mb-0">{PLANET_INFO[p.id].karaka}</p>
          <ul className="pill-list">{PLANET_INFO[p.id].strengths.map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="small mb-0">{SIGNS[p.sign]}, house {p.house} · {p.dignity}</p>
        </div>
      ))}
    </>
  ),
  // 17 challenges
  ({ a }) => (
    <>
      <p>These planets are relatively weaker. They show areas where the child needs patience, support and encouragement.</p>
      {a.weakest.map((p) => (
        <div key={p.id} className="card mb-2">
          <h3 className="mt-0">🌱 {p.id}: {PLANET_INFO[p.id].challenges.join(", ").toLowerCase()}</h3>
          <div className="callout teal small mb-0"><b>How parents can help:</b> {PLANET_INFO[p.id].parentTip}</div>
        </div>
      ))}
    </>
  ),
  // 18 dasha
  ({ s, chart, a }) => (
    <>
      <p>Vimshottari Dasha is a 120-year cycle of planetary periods, starting from the birth nakshatra. Each period activates the planet's results.</p>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Mahadasha</th><th>From</th><th>To</th><th>Child's age</th></tr></thead>
          <tbody>
            {chart.dashas.map((d) => {
              const birthYear = Number(s.dateOfBirth.slice(0, 4));
              const cur = d === a.currentDasha;
              return (
                <tr key={d.lord + d.start} style={cur ? { background: "#fff3e0", fontWeight: 600 } : {}}>
                  <td>{cur ? "▶ " : ""}{d.lord} ({PLANET_HI[d.lord]})</td><td>{d.start}</td><td>{d.end}</td>
                  <td>{Math.max(0, Number(d.start.slice(0, 4)) - birthYear)}–{Number(d.end.slice(0, 4)) - birthYear}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {a.currentDasha && <div className="callout mt-2"><b>Current: {a.currentDasha.lord} Mahadasha.</b> {PLANET_INFO[a.currentDasha.lord].dashaStudent}</div>}
    </>
  ),
  // 19 key periods
  ({ s, a }) => (
    <>
      <p>Sub-periods (Antardasha) over the next years. Use the favourable ones for important exams, admissions and career decisions.</p>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Period</th><th>From</th><th>To</th><th>Guidance</th></tr></thead>
          <tbody>
            {a.subPeriods.slice(0, 10).map((p) => {
              const good = ["Jupiter", "Mercury", "Venus", "Moon"].includes(p.antar) || a.strongest.some((x) => x.id === p.antar);
              return (
                <tr key={p.maha + p.antar + p.start}>
                  <td>{p.maha}–{p.antar}</td><td>{p.start}</td><td>{p.end}</td>
                  <td className="small">{good ? <span className="badge badge-paid">Favourable</span> : <span className="badge badge-pending">Work steadily</span>} {PLANET_INFO[p.antar].dashaStudent.split(".")[0]}.</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small muted mt-1">Ages: from {ageOf(s.dateOfBirth)} onwards. Key decisions like the stream after Class 10 and college admission are best finalised in favourable periods.</p>
    </>
  ),
  // 20 palmistry
  ({ s }) => (
    <>
      <div className="photo-grid mb-2">
        {PHOTO_FIELDS.filter((p) => p.key !== "facePhoto").map((p) => (
          <figure key={p.key}>{s.photos[p.key] ? <img src={s.photos[p.key]} alt={p.label} /> : null}<figcaption>{p.label}</figcaption></figure>
        ))}
      </div>
      <p className="small muted">In palmistry, the right hand usually shows active development and the left hand inborn potential. The astrologer studies the Head line, Heart line, Life line, Fate line, Sun line, the mounts, finger shapes and nails.</p>
      {s.caseStudy?.palmistryNotes ? <div className="callout teal">{lines(s.caseStudy.palmistryNotes)}</div> : <Pending what="The palmistry observations" />}
    </>
  ),
  // 21 face & case study
  ({ s }) => (
    <>
      <div className="flex" style={{ alignItems: "flex-start", gap: 24 }}>
        {s.photos.facePhoto && <img src={s.photos.facePhoto} alt="" style={{ width: 160, height: 200, objectFit: "cover", borderRadius: 12 }} />}
        <div style={{ flex: 1 }}>
          <h3 className="mt-0">Face reading (Samudrika Shastra)</h3>
          {s.caseStudy?.faceReadingNotes ? lines(s.caseStudy.faceReadingNotes) : <Pending what="Face-reading notes" />}
        </div>
      </div>
      <h3>Astrologer's case study</h3>
      {s.caseStudy?.astrologerSummary ? (
        <div className="callout">{lines(s.caseStudy.astrologerSummary)}<div className="small muted">By {s.caseStudy.reviewedBy} · {s.caseStudy.reviewedAt?.slice(0, 10)}</div></div>
      ) : (
        <Pending what="The complete case study" />
      )}
      {s.questions.filter((q) => q.expertAnswer).length > 0 && (
        <>
          <h3>Prashna questions answered</h3>
          {s.questions.filter((q) => q.expertAnswer).slice(0, 3).map((q) => <p key={q.id} className="small"><b>Q: {q.question}</b><br />{q.expertAnswer}</p>)}
        </>
      )}
    </>
  ),
  // 22 remedies & plan
  ({ s, a }) => (
    <>
      <h3 className="mt-0">Simple remedies</h3>
      {s.caseStudy?.remedies ? <div className="callout">{lines(s.caseStudy.remedies)}</div> : (
        <ul>{a.weakest.slice(0, 2).map((p) => <li key={p.id}><b>{p.id}:</b> {PLANET_INFO[p.id].remedy} Mantra: <i>{PLANET_INFO[p.id].mantra}</i> ({PLANET_INFO[p.id].day}). Lucky colour: {PLANET_INFO[p.id].colour}.</li>)}</ul>
      )}
      <h3>Parent action plan</h3>
      {s.caseStudy?.parentGuidance ? <div className="callout teal">{lines(s.caseStudy.parentGuidance)}</div> : (
        <ol>
          <li>Discuss the top 3 career fields (page 14) with {s.fullName.split(" ")[0]} and observe which excites them most.</li>
          <li>Choose the stream: <b>{s.caseStudy?.recommendedStream || a.recommendedStream}</b>, and confirm with the school counsellor and recent marks.</li>
          <li>Build the key skills: {a.topFields[0].skills.join(", ")}.</li>
          <li>Try a short course, workshop or internship in {a.topFields[0].name} during holidays.</li>
          <li>Plan important exams and admissions in the favourable periods (page 19).</li>
          <li>Follow the simple remedies for 40 days with faith and discipline.</li>
        </ol>
      )}
      <div className="card card-soft mt-2">
        <b>Summary:</b> {a.lagnaSign} Lagna, {a.moonSign} Moon · Strongest: {a.strongest.map((p) => p.id).join(", ")} · Top fields: {a.topFields.slice(0, 3).map((f) => f.name).join(", ")} · Stream: {s.caseStudy?.recommendedStream || a.recommendedStream}
      </div>
      <p className="small muted mt-2">Disclaimer: This report is for guidance only and is based on traditional Vedic astrology. It should be combined with academic performance, aptitude and the child's own wishes. It does not guarantee any result.</p>
    </>
  ),
];

function SIGNS_HI_OF(i: number) {
  return ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"][i];
}

export default function Report({ s, chart, a }: Ctx) {
  const allowed = planOf(s.plan).reportPages;
  return (
    <div className="report">
      {PAGES.map((render, i) => {
        const n = i + 1;
        if (n <= allowed) return <Page key={n} n={n} cover={n === 1}>{render({ s, chart, a })}</Page>;
        return (
          <section key={n} className="rpage locked-page no-print">
            <h2>{REPORT_PAGE_TITLES[i].icon} {REPORT_PAGE_TITLES[i].title}</h2>
            <div className="locked">
              <div className="blur" aria-hidden>
                <p>This page contains a personalised analysis of {s.fullName}'s chart, prepared with care for parents, including detailed interpretation and practical guidance.</p>
                <div className="progress mb-2"><span style={{ width: "70%" }} /></div>
                <div className="progress cool mb-2"><span style={{ width: "50%" }} /></div>
                <p>The planets, houses and periods relevant to this topic are explained here in simple language, with clear steps parents can follow at home and in school.</p>
              </div>
              <div className="lock-overlay">
                <div className="lock-icon">🔒</div>
                <b>Page {n} is part of the full report</b>
                <span className="small muted">Unlock all 22 pages, the palmistry & face reading, and counselling.</span>
                <UnlockButton studentId={s.id} goToReport={false}>Unlock for ₹1500</UnlockButton>
              </div>
            </div>
            <div className="pno"><span>{SITE}</span><span>Page {n} of 22</span></div>
          </section>
        );
      })}
    </div>
  );
}
