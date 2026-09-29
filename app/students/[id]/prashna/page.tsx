"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { WithStudent } from "@/components/Guard";
import StudentHeader from "@/components/StudentHeader";
import Kundali from "@/components/Kundali";
import { askQuestion, type Student } from "@/lib/store";
import { planOf } from "@/lib/plans";
import { CITIES } from "@/lib/cities";
import { PRASHNA_CATEGORIES, type PrashnaCategory, castPrashna } from "@/lib/astro/prashna";
import UnlockButton from "@/components/UnlockButton";

const SAMPLE_QUESTIONS = [
  "Should my child take Science or Commerce after Class 10?",
  "Will my child clear the NEET / JEE exam this year?",
  "Is studying abroad good for my child's career?",
  "Which career will bring my child success and happiness?",
];

function verdictBadge(v: string) {
  if (v.startsWith("Favourable")) return "badge-paid";
  if (v.startsWith("Mixed")) return "badge-pending";
  return "badge-danger";
}

function Prashna({ s }: { s: Student }) {
  const plan = planOf(s.plan);
  const left = plan.prashnaQuestions - s.questions.length;
  const [category, setCategory] = useState<PrashnaCategory>("CAREER");
  const [question, setQuestion] = useState("");
  const [city, setCity] = useState(0);
  const [error, setError] = useState("");
  const [preview] = useState(() => castPrashna("GENERAL", CITIES[0].lat, CITIES[0].lon, 5.5).chart);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = CITIES[city];
    try {
      askQuestion(s.id, { category, question, lat: c.lat, lon: c.lon, tz: c.tz, place: `${c.name}, ${c.region}` });
      setQuestion("");
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="container section-sm">
      <div className="grid grid-main">
        <div className="stack">
          <div className="card">
            <div className="card-title"><div className="icon-bubble violet">❓</div><div><h3 className="mb-0">Ask a Prashna question</h3><div className="small muted">A chart is cast for the exact moment you ask</div></div></div>
            <div className="alert alert-info small">
              🙏 <b>How to ask:</b> sit calmly, think about your child, and ask <b>one clear question</b> sincerely. Do not ask the same question twice.
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {left > 0 ? (
              <form onSubmit={submit}>
                <div className="field">
                  <label>Topic</label>
                  <div className="radio-pills">
                    {(Object.keys(PRASHNA_CATEGORIES) as PrashnaCategory[]).map((k) => (
                      <label key={k}><input type="radio" checked={category === k} onChange={() => setCategory(k)} /><span>{PRASHNA_CATEGORIES[k].icon} {PRASHNA_CATEGORIES[k].label}</span></label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Your question</label>
                  <textarea className="textarea" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question here…" maxLength={500} />
                  <div className="flex flex-wrap" style={{ gap: 6 }}>
                    {SAMPLE_QUESTIONS.map((q) => (
                      <button type="button" key={q} className="badge badge-info" style={{ border: 0, cursor: "pointer" }} onClick={() => setQuestion(q)}>{q}</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Where are you right now?</label>
                  <select className="select" value={city} onChange={(e) => setCity(Number(e.target.value))}>
                    {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}, {c.region}</option>)}
                  </select>
                  <span className="hint">Prashna uses the place where the question is asked.</span>
                </div>
                <div className="flex between flex-wrap">
                  <span className="small muted">{left} of {plan.prashnaQuestions} questions left</span>
                  <button className="btn btn-primary">🔮 Cast Prashna chart</button>
                </div>
              </form>
            ) : (
              <div className="center">
                <p><b>You have used all {plan.prashnaQuestions} question(s) on the {plan.name} plan.</b></p>
                <UnlockButton studentId={s.id} goToReport={false}>Upgrade for more questions</UnlockButton>
              </div>
            )}
          </div>

          <h3 className="mt-3">Your questions ({s.questions.length})</h3>
          {s.questions.length === 0 && <div className="card muted center">No questions yet. Your first question is free!</div>}
          {s.questions.map((q) => (
            <div key={q.id} className="qa">
              <div className="flex between flex-wrap">
                <span className="small muted">{PRASHNA_CATEGORIES[q.category].icon} {PRASHNA_CATEGORIES[q.category].label} · {new Date(q.askedAt).toLocaleString("en-IN")} · {q.place}</span>
                <span className={`badge ${verdictBadge(q.reading.verdict)}`}>{q.reading.verdict}</span>
              </div>
              <h3 className="mt-1" style={{ fontSize: "1.1rem" }}>“{q.question}”</h3>
              <p className="small"><b>Prashna Lagna:</b> {q.reading.lagna} · <b>Moon Nakshatra:</b> {q.reading.moonNakshatra}</p>
              <div className="callout violet small">
                <b>System reading:</b> {q.reading.summary}
                <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>{q.reading.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
              {q.expertAnswer ? (
                <div className="callout teal small mb-0"><b>🧑‍🏫 Astrologer's answer:</b> {q.expertAnswer}</div>
              ) : plan.expertReview ? (
                <p className="small muted mb-0">⏳ Our astrologer will add a personal answer soon.</p>
              ) : (
                <p className="small muted mb-0">🔒 Personal answers from our astrologer come with the paid plans. <Link href={`/students/${s.id}/checkout`}>Upgrade</Link></p>
              )}
            </div>
          ))}
        </div>

        <div className="stack">
          <div className="card">
            <h3>What is Prashna Kundali?</h3>
            <p className="small">
              Prashna (horary) astrology casts a chart for the <b>moment a sincere question is asked</b>. The Lagna, the Moon and the lord of the house related to the question show the likely outcome.
            </p>
            <p className="small mb-0">It is especially helpful when the <b>birth time is not known</b>, and for focused decisions like exams, admissions and choosing a stream.</p>
          </div>
          <div className="card">
            <h3 className="small">The sky right now (New Delhi)</h3>
            <Kundali chart={preview} title="Prashna chart now" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrashnaPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <WithStudent id={id}>
      {(s) => (
        <>
          <StudentHeader s={s} />
          <Prashna s={s} />
        </>
      )}
    </WithStudent>
  );
}
