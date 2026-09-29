"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/Guard";
import Kundali from "@/components/Kundali";
import PlanetTable from "@/components/PlanetTable";
import {
  MEETING_MINUTES, PHOTO_FIELDS, STATUS_LABEL, ageOf, answerQuestion, formatSlot, googleCalendarUrl, saveCaseStudy, updateSession, useDB,
  type CaseStudy, type Student, type StudentStatus, type User,
} from "@/lib/store";
import { useChart } from "@/lib/useChart";
import { PLANS } from "@/lib/plans";
import { PRASHNA_CATEGORIES } from "@/lib/astro/prashna";
import Photo from "@/components/Photo";

const STREAMS = ["", "Science (PCM)", "Science (PCB)", "Science (PCMB)", "Commerce", "Commerce with Maths", "Humanities / Arts"];

function Review({ s, parent, me }: { s: Student; parent?: User; me: User }) {
  const { chart, analysis: a } = useChart(s);
  const [cs, setCs] = useState<CaseStudy>(
    s.caseStudy ?? { palmistryNotes: "", faceReadingNotes: "", astrologerSummary: "", recommendedStream: "", remedies: "", parentGuidance: "" },
  );
  const [status, setStatus] = useState<StudentStatus>(s.status === "PAID" ? "UNDER_REVIEW" : s.status);
  const [saved, setSaved] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const set = (k: keyof CaseStudy, v: string) => { setSaved(false); setCs((x) => ({ ...x, [k]: v })); };

  const area = (k: keyof CaseStudy, label: string, placeholder: string, rows = 5) => (
    <div className="field">
      <label>{label}</label>
      <textarea className="textarea" rows={rows} value={(cs[k] as string) || ""} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
    </div>
  );

  return (
    <>
      <section className="page-head">
        <div className="container flex between flex-wrap">
          <div>
            <Link href="/admin" style={{ color: "#d9d2ff" }} className="small">← All profiles</Link>
            <h1>{s.fullName}</h1>
            <p>{s.currentClass} · {ageOf(s.dateOfBirth)} yrs · {s.dateOfBirth} {s.timeOfBirth} ({s.birthTimeAccuracy.toLowerCase()}) · {s.birthPlace}</p>
            <p className="small">Parent: {parent?.name} · {parent?.email} · {parent?.phone}</p>
          </div>
          <div className="flex flex-wrap">
            <span className="badge badge-premium">{PLANS[s.plan].name}</span>
            <Link href={`/students/${s.id}/edit`} className="btn btn-ghost-light btn-sm">✏️ Edit details</Link>
            <Link href={`/students/${s.id}/report`} className="btn btn-ghost-light btn-sm">View report as parent</Link>
          </div>
        </div>
      </section>

      <div className="container page-body">
        <div className="grid grid-main">
          <div className="stack">
            <div className="card">
              <h3>📸 Photos (click to enlarge)</h3>
              <div className="photo-grid">
                {PHOTO_FIELDS.map((p) => (
                  <figure key={p.key} onClick={() => s.photos[p.key] && setZoom(s.photos[p.key]!)} style={{ cursor: "zoom-in" }}>
                    <Photo photo={s.photos[p.key]} alt={p.label} fallback={<div className="upload-tile" style={{ minHeight: 150 }}>Missing</div>} />
                    <figcaption>{p.label}</figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>📝 Case study</h3>
              {saved && <div className="alert alert-success">Saved. The parent can now see it in the report.</div>}
              {area("palmistryNotes", "Palmistry observations (report page 20)", "Head line, heart line, life line, fate line, Sun line, mounts, fingers, thumb, nails…", 7)}
              {area("faceReadingNotes", "Face reading (page 21)", "Forehead, eyes, eyebrows, nose, ears, lips, chin, overall expression…")}
              {area("astrologerSummary", "Case study summary (pages 21 & overview)", "Overall assessment combining Kundali, Prashna, palm and face…", 6)}
              <div className="field">
                <label>Final recommended stream (overrides the system suggestion)</label>
                <select className="select" value={cs.recommendedStream} onChange={(e) => set("recommendedStream", e.target.value)}>
                  {STREAMS.map((x) => <option key={x} value={x}>{x || `Use system suggestion (${a.recommendedStream})`}</option>)}
                </select>
              </div>
              {area("remedies", "Remedies (page 22)", "Leave empty to use the automatic remedies for the weaker planets", 4)}
              {area("parentGuidance", "Parent action plan (page 22)", "Leave empty to use the automatic action plan", 4)}
              <div className="field">
                <label>Profile status</label>
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value as StudentStatus)}>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={() => { saveCaseStudy(s.id, cs, me.name, status); setSaved(true); }}>💾 Save case study</button>
            </div>

            <div className="card">
              <h3>❓ Prashna questions ({s.questions.length})</h3>
              {s.questions.length === 0 && <p className="muted small">No questions yet.</p>}
              {s.questions.map((q) => <AnswerBox key={q.id} s={s} q={q} />)}
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <Kundali chart={chart} />
              <dl className="kv small mt-2">
                <dt>Top fields</dt><dd>{a.topFields.slice(0, 3).map((f) => `${f.name} (${f.percent}%)`).join(", ")}</dd>
                <dt>System stream</dt><dd>{a.recommendedStream}</dd>
                <dt>Strongest</dt><dd>{a.strongest.map((p) => p.id).join(", ")}</dd>
                <dt>Weakest</dt><dd>{a.weakest.map((p) => p.id).join(", ")}</dd>
                <dt>Dasha</dt><dd>{a.currentDasha?.lord} till {a.currentDasha?.end}</dd>
              </dl>
            </div>
            <PlanetTable chart={chart} compact />
            <div className="card">
              <h3>👨‍👩‍👧 Parent's input</h3>
              <dl className="kv small">
                <dt>Subjects</dt><dd>{s.favouriteSubjects || "—"}</dd>
                <dt>Hobbies</dt><dd>{s.hobbies || "—"}</dd>
                <dt>Achievements</dt><dd>{s.achievements || "—"}</dd>
                <dt>Goals</dt><dd>{s.parentGoals || "—"}</dd>
                <dt>Health</dt><dd>{s.healthNotes || "—"}</dd>
              </dl>
            </div>
            <div className="card">
              <h3>🎥 Google Meet sessions</h3>
              {s.sessions.length === 0 && <p className="muted small mb-0">No requests.</p>}
              {s.sessions.map((x) => <SessionRow key={x.id} s={s} x={x} />)}
            </div>
          </div>
        </div>
      </div>

      {zoom && (
        <div onClick={() => setZoom(null)} style={{ position: "fixed", inset: 0, background: "rgba(10,5,40,.85)", zIndex: 100, display: "grid", placeItems: "center", padding: 20, cursor: "zoom-out" }}>
          <Photo photo={zoom} style={{ maxHeight: "90vh", maxWidth: "90vw", borderRadius: 12 }} />
        </div>
      )}
    </>
  );
}

function AnswerBox({ s, q }: { s: Student; q: Student["questions"][number] }) {
  const [text, setText] = useState(q.expertAnswer ?? "");
  const [ok, setOk] = useState(false);
  return (
    <div className="qa">
      <div className="small muted">{PRASHNA_CATEGORIES[q.category].label} · {new Date(q.askedAt).toLocaleString("en-IN")} · {q.place}</div>
      <b>“{q.question}”</b>
      <p className="small mt-1">System: <b>{q.reading.verdict}</b> (score {q.reading.score}) · Lagna {q.reading.lagna} · Moon in {q.reading.moonNakshatra}</p>
      <textarea className="textarea" rows={3} value={text} onChange={(e) => { setText(e.target.value); setOk(false); }} placeholder="Write your answer for the parent…" />
      <div className="flex mt-1">
        <button className="btn btn-secondary btn-sm" disabled={!text.trim()} onClick={() => { answerQuestion(s.id, q.id, text.trim()); setOk(true); }}>
          {q.expertAnswer ? "Update answer" : "Send answer"}
        </button>
        {ok && <span className="small" style={{ color: "var(--green)" }}>✓ Sent</span>}
      </div>
    </div>
  );
}

function SessionRow({ s, x }: { s: Student; x: Student["sessions"][number] }) {
  const [link, setLink] = useState(x.meetingLink ?? "");
  const [err, setErr] = useState("");
  const validLink = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(link.trim());
  return (
    <div style={{ borderBottom: "1px solid var(--line)", padding: "10px 0" }} className="small">
      <b>{formatSlot(x.preferredDate, x.preferredTime)}</b> · {x.mode === "GOOGLE_MEET" ? `Google Meet · ${x.durationMin ?? MEETING_MINUTES} min` : x.mode}{" "}
      <span className="badge badge-info">{x.status}</span>
      {x.notes && <div className="muted">Parent's note: {x.notes}</div>}
      {x.status !== "CANCELLED" && x.status !== "DONE" && (
        <>
          <ol className="muted" style={{ margin: "8px 0", paddingLeft: 18 }}>
            <li>Click <b>Create Google Meet</b> (opens a new meeting in your Google account).</li>
            <li>Copy the meeting link and paste it below, then click <b>Confirm & send link</b>.</li>
          </ol>
          <div className="flex flex-wrap">
            <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">➕ Create Google Meet ↗</a>
            <a href={googleCalendarUrl(s, x)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">📅 Add to my calendar</a>
          </div>
          <input className="input mt-1" placeholder="https://meet.google.com/abc-defg-hij" value={link} onChange={(e) => { setLink(e.target.value); setErr(""); }} />
        </>
      )}
      {x.meetingLink && <div className="mt-1"><a href={x.meetingLink} target="_blank" rel="noreferrer">{x.meetingLink}</a></div>}
      {err && <div className="alert alert-error mt-1 mb-0">{err}</div>}
      <div className="flex flex-wrap mt-1">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (!validLink) return setErr("Please paste a valid Google Meet link, e.g. https://meet.google.com/abc-defg-hij");
            updateSession(s.id, x.id, { status: "CONFIRMED", meetingLink: link.trim() });
          }}
        >
          Confirm & send link
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => updateSession(s.id, x.id, { status: "DONE" })}>Mark done</button>
        <button className="btn btn-outline btn-sm" onClick={() => updateSession(s.id, x.id, { status: "CANCELLED" })}>Cancel</button>
      </div>
    </div>
  );
}

export default function AdminStudentPage() {
  const { id } = useParams<{ id: string }>();
  const { db } = useDB();
  return (
    <RequireAuth admin>
      {(me) => {
        const s = db.students.find((x) => x.id === id);
        if (!s) return <div className="container section center"><h2>Profile not found</h2><Link href="/admin">Back</Link></div>;
        return <Review s={s} parent={db.users.find((u) => u.id === s.parentId)} me={me} />;
      }}
    </RequireAuth>
  );
}
