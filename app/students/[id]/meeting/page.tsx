"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { WithStudent } from "@/components/Guard";
import StudentHeader from "@/components/StudentHeader";
import MeetIcon from "@/components/MeetIcon";
import {
  MEETING_MINUTES, MEETING_TIMES, activeMeeting, bookMeeting, formatSlot, googleCalendarUrl,
  meetingDays, payForPlan, takenSlots, updateSession, useDB, type Student,
} from "@/lib/store";
import { PLANS, TEST_MODE, formatINR, isPaid } from "@/lib/plans";

function Steps({ step }: { step: number }) {
  const steps = [
    { icon: "📝", label: "Form submitted" },
    { icon: "💳", label: "Pay full fee" },
    { icon: "📅", label: "Pick a slot" },
    { icon: "🎥", label: "Google Meet" },
  ];
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={s.label} className={`s ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
          <div className="dot">{i < step ? "✓" : s.icon}</div>
          {s.label}
        </div>
      ))}
    </div>
  );
}

function PayStep({ s }: { s: Student }) {
  const fee = PLANS.STANDARD;
  return (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      <div>
        <h2>Pay the full fee to book your Google Meet</h2>
        <p className="muted">
          The 30-minute Google Meet counselling session with our astrologer is part of the complete Career Report. Pay the full fee once, then choose a time 2–3 days from now, so we have time to study {s.fullName.split(" ")[0]}'s Kundali, palms and face before the meeting.
        </p>
        <ul className="check-list">
          <li>30-minute Google Meet with the astrologer (parents + child)</li>
          <li>Full 22-page personalised career report</li>
          <li>Palmistry & face-reading case study</li>
          <li>{fee.prashnaQuestions} Prashna questions with expert answers</li>
        </ul>
      </div>
      <div className="card price-card featured" style={{ transform: "none" }}>
        <span className="ribbon">Required for the meeting</span>
        <h3 className="mb-0">{fee.name}</h3>
        <div className="price">{formatINR(fee.price)} <small>full fee</small></div>
        <p className="small muted">One-time payment for {s.fullName}. No hidden charges.</p>
        {TEST_MODE ? (
          <button className="btn btn-primary btn-block btn-lg" onClick={() => payForPlan(s.id, "STANDARD", "TEST")}>
            Pay {formatINR(fee.price)} & choose a slot →
          </button>
        ) : (
          <Link href={`/students/${s.id}/checkout?next=meeting`} className="btn btn-primary btn-block btn-lg">Pay {formatINR(fee.price)} & choose a slot →</Link>
        )}
        <p className="small muted center mt-1 mb-0">{TEST_MODE ? "Test mode: unlocks instantly, no payment." : "🔒 Secure payment"}</p>
      </div>
    </div>
  );
}

function SlotStep({ s }: { s: Student }) {
  const { db } = useDB();
  const days = meetingDays(s.createdAt);
  const taken = takenSlots(db);
  const [day, setDay] = useState(days[0]);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function confirm() {
    try {
      bookMeeting(s.id, day, time, notes);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="flex mb-2">
        <MeetIcon size={40} />
        <div>
          <h2 className="mb-0">Choose a time for your Google Meet</h2>
          <p className="muted mb-0">{MEETING_MINUTES}-minute video session · India time (IST) · available 2–3 days after the form</p>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="field">
        <label>Day</label>
        <div className="radio-pills">
          {days.map((d) => (
            <label key={d}>
              <input type="radio" checked={day === d} onChange={() => { setDay(d); setTime(""); }} />
              <span>{new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Time ({MEETING_MINUTES} min)</label>
        <div className="slot-grid">
          {MEETING_TIMES.map((t) => {
            const busy = taken.has(`${day} ${t}`);
            return (
              <button
                key={t} type="button" disabled={busy}
                className={`slot ${time === t ? "selected" : ""}`}
                onClick={() => setTime(t)}
                title={busy ? "Already booked" : undefined}
              >
                {new Date(`${day}T${t}:00`).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                {busy && <small>Booked</small>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="field">
        <label>Anything you want to discuss? (optional)</label>
        <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Science vs Commerce, NEET preparation, study abroad…" />
      </div>
      <div className="flex between flex-wrap">
        <span className="small muted">{time ? `Selected: ${formatSlot(day, time)} – ${MEETING_MINUTES} minutes` : "Please select a time"}</span>
        <button className="btn btn-primary btn-lg" disabled={!time} onClick={confirm}>Confirm Google Meet booking</button>
      </div>
    </div>
  );
}

function BookedStep({ s }: { s: Student }) {
  const m = activeMeeting(s)!;
  const confirmed = m.status === "CONFIRMED" && m.meetingLink;
  return (
    <div className="center">
      <div className="meet-card">
        <MeetIcon size={56} />
        <h2 className="mt-2 mb-0">Your Google Meet is booked 🎉</h2>
        <p className="muted">Career counselling for {s.fullName}</p>
        <div className="meet-time">
          <b>{formatSlot(m.preferredDate, m.preferredTime)}</b>
          <span>{m.durationMin ?? MEETING_MINUTES} minutes · India time (IST)</span>
        </div>
        {confirmed ? (
          <div className="alert alert-success">✅ Confirmed by the astrologer. Join from the link below at the meeting time.</div>
        ) : (
          <div className="alert alert-info">⏳ The astrologer will confirm and share the Google Meet link here before the meeting. You will also see it on the child's profile.</div>
        )}
        <div className="flex flex-wrap" style={{ justifyContent: "center" }}>
          {confirmed ? (
            <a href={m.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">🎥 Join Google Meet</a>
          ) : (
            <button className="btn btn-primary btn-lg" disabled>🎥 Join link coming soon</button>
          )}
          <a href={googleCalendarUrl(s, m)} target="_blank" rel="noreferrer" className="btn btn-outline btn-lg">📅 Add to Google Calendar</a>
        </div>
        <div className="card card-soft small mt-3" style={{ textAlign: "left" }}>
          <b>Before the meeting:</b>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            <li>Both parents and the child should join if possible.</li>
            <li>Keep the child's latest mark sheet and your questions ready.</li>
            <li>Use a laptop or phone with a good internet connection and working camera.</li>
          </ul>
        </div>
        <div className="flex flex-wrap mt-3" style={{ justifyContent: "center" }}>
          <Link href={`/students/${s.id}/report`} className="btn btn-secondary">📘 Open the full report</Link>
          <Link href={`/students/${s.id}`} className="btn btn-outline">Go to profile</Link>
          {!confirmed && (
            <button className="btn btn-outline" onClick={() => { if (window.confirm("Cancel this meeting and choose another time?")) updateSession(s.id, m.id, { status: "CANCELLED" }); }}>
              Change time
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Meeting({ s }: { s: Student }) {
  const fresh = useSearchParams().get("new");
  const paid = isPaid(s.plan);
  const booked = activeMeeting(s);
  const done = s.sessions.find((x) => x.mode === "GOOGLE_MEET" && x.status === "DONE");
  const step = !paid ? 1 : booked ? 3 : 2;

  return (
    <div className="container container-narrow section-sm">
      {fresh && !booked && (
        <div className="alert alert-success">🎉 <b>{s.fullName}'s form has been submitted.</b> The next step is a 30-minute Google Meet with our astrologer.</div>
      )}
      <div className="card" style={{ padding: 32 }}>
        <Steps step={done ? 4 : step} />
        {done && !booked ? (
          <div className="center">
            <MeetIcon size={48} />
            <h2 className="mt-2">Counselling completed ✅</h2>
            <p className="muted">Your Google Meet on {formatSlot(done.preferredDate, done.preferredTime)} is complete. Your full report is ready.</p>
            <Link href={`/students/${s.id}/report`} className="btn btn-primary">Open the report</Link>
          </div>
        ) : step === 1 ? <PayStep s={s} /> : step === 2 ? <SlotStep s={s} /> : <BookedStep s={s} />}
      </div>
    </div>
  );
}

export default function MeetingPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <WithStudent id={id}>
      {(s) => (
        <>
          <StudentHeader s={s} />
          <Meeting s={s} />
        </>
      )}
    </WithStudent>
  );
}
