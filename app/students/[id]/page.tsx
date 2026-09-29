"use client";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { WithStudent } from "@/components/Guard";
import StudentHeader from "@/components/StudentHeader";
import Kundali from "@/components/Kundali";
import Locked from "@/components/Locked";
import { PHOTO_FIELDS, STATUS_LABEL, activeMeeting, deleteStudent, formatSlot, googleCalendarUrl, type Student, type StudentStatus } from "@/lib/store";
import MeetIcon from "@/components/MeetIcon";
import { useChart } from "@/lib/useChart";
import { isPaid, planOf } from "@/lib/plans";
import { NAKSHATRAS, PLANET_HI } from "@/lib/astro/engine";
import UnlockButton from "@/components/UnlockButton";
import Photo from "@/components/Photo";

const FLOW: StudentStatus[] = ["REGISTERED", "PAID", "UNDER_REVIEW", "REPORT_READY", "COUNSELLED"];

function Overview({ s }: { s: Student }) {
  const { chart, analysis: a } = useChart(s);
  const params = useSearchParams();
  const welcome = params.get("welcome");
  const savedMsg = params.get("saved");
  const router = useRouter();
  const plan = planOf(s.plan);
  const paid = isPaid(s.plan);
  const statusIdx = FLOW.indexOf(s.status);
  const sessionsUsed = s.sessions.filter((x) => x.status !== "CANCELLED").length;

  return (
    <div className="container section-sm">
      {savedMsg && <div className="alert alert-success">✅ <b>Changes saved.</b> The Kundali and report have been updated with the new details.</div>}
      {welcome && (
        <div className="alert alert-success">
          🎉 <b>{s.fullName}'s profile is created!</b> The Kundali is ready below. Unlock the full 22-page report to get the astrologer's case study and counselling.
        </div>
      )}

      <div className="grid grid-main">
        <div className="stack">
          <div className="card">
            <div className="card-title"><div className="icon-bubble">🪐</div><h3 className="mb-0">Birth chart</h3></div>
            <div className="grid grid-2" style={{ alignItems: "center" }}>
              <Kundali chart={chart} />
              <dl className="kv">
                <dt>Lagna</dt><dd>{a.lagnaSign} (lord {a.lagnaLord})</dd>
                <dt>Moon sign</dt><dd>{a.moonSign}</dd>
                <dt>Sun sign</dt><dd>{a.sunSign}</dd>
                <dt>Nakshatra</dt><dd>{NAKSHATRAS[chart.moonNakshatra.index]} – pada {chart.moonNakshatra.pada}</dd>
                <dt>Element</dt><dd>{a.dominantElement}</dd>
                <dt>Current dasha</dt><dd>{a.currentDasha?.lord} ({PLANET_HI[a.currentDasha!.lord]}) until {a.currentDasha?.end.slice(0, 4)}</dd>
                <dt>Strongest planet</dt><dd>{a.strongest[0].id}</dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><div className="icon-bubble violet">🎯</div><h3 className="mb-0">Career direction</h3></div>
            <div className="meter">
              <span>{a.topFields[0].icon} {a.topFields[0].name}</span>
              <div className="progress"><span style={{ width: `${a.topFields[0].percent}%` }} /></div>
              <b>{a.topFields[0].percent}%</b>
            </div>
            {paid ? (
              <>
                {a.topFields.slice(1).map((f) => (
                  <div className="meter" key={f.id}>
                    <span>{f.icon} {f.name}</span>
                    <div className="progress cool"><span style={{ width: `${f.percent}%` }} /></div>
                    <b>{f.percent}%</b>
                  </div>
                ))}
                <div className="callout mt-2 mb-0"><b>Recommended stream:</b> {s.caseStudy?.recommendedStream || a.recommendedStream}</div>
              </>
            ) : (
              <Locked studentId={s.id}>
                {a.topFields.slice(1).map((f) => (
                  <div className="meter" key={f.id}>
                    <span>{f.icon} {f.name}</span>
                    <div className="progress cool"><span style={{ width: `${f.percent}%` }} /></div>
                    <b>{f.percent}%</b>
                  </div>
                ))}
                <div className="callout">Recommended stream: Science</div>
              </Locked>
            )}
          </div>

          <div className="card">
            <div className="card-title"><div className="icon-bubble pink">📸</div><h3 className="mb-0">Photos for case study</h3></div>
            <div className="photo-grid">
              {PHOTO_FIELDS.map((p) => (
                <figure key={p.key}>
                  <Photo photo={s.photos[p.key]} alt={p.label} fallback={<div className="upload-tile" style={{ minHeight: 150 }}>Missing</div>} />
                  <figcaption>{p.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          {s.caseStudy && paid && (
            <div className="card">
              <div className="card-title"><div className="icon-bubble teal">🧑‍🏫</div><h3 className="mb-0">Astrologer's case study</h3></div>
              <p>{s.caseStudy.astrologerSummary}</p>
              <p className="small muted mb-0">Reviewed by {s.caseStudy.reviewedBy} on {s.caseStudy.reviewedAt?.slice(0, 10)}. See pages 20–22 of the report for full details.</p>
            </div>
          )}
        </div>

        <div className="stack">
          <div className="card">
            <h3>Progress</h3>
            <ul className="timeline">
              {FLOW.map((st, i) => (
                <li key={st} className={i < statusIdx ? "done" : i === statusIdx ? "current" : ""}>
                  <span className="tdot" />
                  <b className="small">{STATUS_LABEL[st]}</b>
                </li>
              ))}
            </ul>
            {!paid && <UnlockButton studentId={s.id} className="btn btn-primary btn-block">Unlock full report – ₹1500</UnlockButton>}
          </div>

          <div className="card">
            <h3>Plan usage</h3>
            <div className="small">Report pages unlocked</div>
            <div className="progress mb-2"><span style={{ width: `${(plan.reportPages / 22) * 100}%` }} /></div>
            <div className="small">Prashna questions: {s.questions.length} / {plan.prashnaQuestions}</div>
            <div className="progress cool mb-2"><span style={{ width: `${Math.min(100, (s.questions.length / plan.prashnaQuestions) * 100)}%` }} /></div>
            <div className="small">Counselling sessions: {sessionsUsed} / {plan.counsellingSessions}</div>
            <div className="flex flex-wrap mt-2">
              <Link href={`/students/${s.id}/report`} className="btn btn-secondary btn-sm">📘 Open report</Link>
              <Link href={`/students/${s.id}/prashna`} className="btn btn-outline btn-sm">❓ Ask a question</Link>
            </div>
          </div>

          <SessionBox s={s} />

          <div className="card">
            <div className="flex between">
              <h3 className="mb-0">Details given</h3>
              <Link href={`/students/${s.id}/edit`} className="btn btn-outline btn-sm">✏️ Edit details</Link>
            </div>
            <dl className="kv small">
              <dt>Birth time</dt><dd>{s.birthTimeAccuracy === "UNKNOWN" ? "Not known" : `${s.timeOfBirth} (${s.birthTimeAccuracy.toLowerCase()})`}</dd>
              <dt>School</dt><dd>{s.schoolName || "—"}</dd>
              <dt>Subjects</dt><dd>{s.favouriteSubjects || "—"}</dd>
              <dt>Hobbies</dt><dd>{s.hobbies || "—"}</dd>
              <dt>Parents' goals</dt><dd>{s.parentGoals || "—"}</dd>
            </dl>
            <button
              className="btn btn-outline btn-sm mt-2"
              style={{ color: "var(--red)" }}
              onClick={() => { if (confirm(`Delete ${s.fullName}'s profile permanently? This also deletes the photos, questions and meeting bookings.`)) { deleteStudent(s.id); router.push("/dashboard"); } }}
            >
              Delete profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionBox({ s }: { s: Student }) {
  const paid = isPaid(s.plan);
  const m = activeMeeting(s);
  const done = s.sessions.find((x) => x.mode === "GOOGLE_MEET" && x.status === "DONE");
  return (
    <div className="card">
      <div className="meet-banner mb-2">
        <MeetIcon size={40} />
        <div>
          <h3 className="mb-0">Google Meet counselling</h3>
          <div className="small muted">30 minutes with the astrologer, 2–3 days after the form</div>
        </div>
      </div>
      {m ? (
        <>
          <div className="meet-time" style={{ margin: "0 0 12px", alignItems: "flex-start" }}>
            <b style={{ fontSize: "1.15rem" }}>{formatSlot(m.preferredDate, m.preferredTime)}</b>
            <span>{m.status === "CONFIRMED" && m.meetingLink ? "Confirmed ✅" : "Waiting for the astrologer to share the Meet link"}</span>
          </div>
          <div className="flex flex-wrap">
            {m.status === "CONFIRMED" && m.meetingLink && (
              <a href={m.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">🎥 Join Google Meet</a>
            )}
            <a href={googleCalendarUrl(s, m)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">📅 Add to calendar</a>
            <Link href={`/students/${s.id}/meeting`} className="btn btn-outline btn-sm">Details</Link>
          </div>
        </>
      ) : done ? (
        <p className="small mb-0">✅ Counselling completed on {formatSlot(done.preferredDate, done.preferredTime)}.</p>
      ) : (
        <>
          <p className="small muted">{paid ? "Your fee is paid. Choose a time for the meeting." : "Pay the full fee (₹1500) to book your Google Meet session."}</p>
          <Link href={`/students/${s.id}/meeting`} className="btn btn-primary btn-sm">{paid ? "📅 Choose a meeting slot" : "Pay & book Google Meet"}</Link>
        </>
      )}
    </div>
  );
}

export default function StudentPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <WithStudent id={id}>
      {(s) => (
        <>
          <StudentHeader s={s} />
          <Overview s={s} />
        </>
      )}
    </WithStudent>
  );
}
