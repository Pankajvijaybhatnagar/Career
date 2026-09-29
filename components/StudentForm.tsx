"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DateOfBirthSelect, { MIN_BIRTH_YEAR } from "./DateOfBirthSelect";
import Photo from "./Photo";
import { CITIES } from "@/lib/cities";
import { deletePhotos } from "@/lib/photoStore";
import {
  PHOTO_FIELDS, addStudent, clearDraft, loadDraft, saveDraft, saveUploadedPhoto, updateStudent,
  type NewStudent, type PhotoKey, type Student, type User,
} from "@/lib/store";

const STEPS = [
  { icon: "👧", label: "Child details" },
  { icon: "🪐", label: "Birth details" },
  { icon: "📸", label: "Photos" },
  { icon: "💬", label: "Parents' input" },
];

const CLASSES = [
  "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12",
  "College – 1st year", "College – 2nd year+", "Dropped / Gap year", "Working professional / Adult",
];

type Details = Omit<NewStudent, "photos"> & { cityIndex: string };
type Photos = Partial<Record<PhotoKey, string>>;
type Draft = { step: number; maxStep: number; f: Details; photos: Photos; savedAt: string };

const EMPTY: Details = {
  fullName: "", gender: "MALE", dateOfBirth: "", timeOfBirth: "", birthTimeAccuracy: "EXACT",
  birthPlace: "New Delhi, Delhi", latitude: 28.6139, longitude: 77.209, tzOffset: 5.5, cityIndex: "0",
  currentClass: "Class 9", schoolName: "", favouriteSubjects: "", hobbies: "", achievements: "", parentGoals: "", healthNotes: "",
};

function fromStudent(s: Student): Details {
  const idx = CITIES.findIndex((c) => `${c.name}, ${c.region}` === s.birthPlace);
  return {
    fullName: s.fullName, gender: s.gender, dateOfBirth: s.dateOfBirth,
    timeOfBirth: s.birthTimeAccuracy === "UNKNOWN" ? "" : s.timeOfBirth, birthTimeAccuracy: s.birthTimeAccuracy,
    birthPlace: s.birthPlace, latitude: s.latitude, longitude: s.longitude, tzOffset: s.tzOffset,
    cityIndex: idx >= 0 ? String(idx) : "custom",
    currentClass: s.currentClass, schoolName: s.schoolName, favouriteSubjects: s.favouriteSubjects, hobbies: s.hobbies,
    achievements: s.achievements, parentGoals: s.parentGoals, healthNotes: s.healthNotes,
  };
}

export default function StudentForm({ user, student }: { user: User; student?: Student }) {
  const router = useRouter();
  const editing = !!student;
  const draftId = student?.id;
  const [restored] = useState(() => loadDraft<Draft>(user.id, draftId));
  const [step, setStep] = useState(restored?.step ?? 0);
  const [maxStep, setMaxStep] = useState(restored?.maxStep ?? (editing ? 3 : 0));
  const [f, setF] = useState<Details>(restored?.f ?? (student ? fromStudent(student) : EMPTY));
  const [photos, setPhotos] = useState<Photos>(restored?.photos ?? { ...(student?.photos ?? {}) });
  const [showRestored, setShowRestored] = useState(!!restored);
  const [busy, setBusy] = useState<PhotoKey | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const errorRef = useRef<HTMLDivElement>(null);
  const submitted = useRef(false);

  // Autosave the draft on every change, so a refresh or accidental navigation never loses data.
  useEffect(() => {
    if (submitted.current) return;
    saveDraft(user.id, { step, maxStep, f, photos, savedAt: new Date().toISOString() } satisfies Draft, draftId);
  }, [user.id, draftId, step, maxStep, f, photos]);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

  const set = <K extends keyof Details>(k: K, v: Details[K]) => { setError(""); setF((x) => ({ ...x, [k]: v })); };

  function chooseCity(idx: string) {
    setError("");
    if (idx === "custom") return setF((x) => ({ ...x, cityIndex: idx, birthPlace: x.cityIndex === "custom" ? x.birthPlace : "" }));
    const c = CITIES[Number(idx)];
    setF((x) => ({ ...x, cityIndex: idx, birthPlace: `${c.name}, ${c.region}`, latitude: c.lat, longitude: c.lon, tzOffset: c.tz }));
  }

  async function onPhoto(key: PhotoKey, file?: File) {
    if (!file) return;
    setError("");
    setBusy(key);
    try {
      const ref = await saveUploadedPhoto(file);
      const old = photos[key];
      setPhotos((p) => ({ ...p, [key]: ref }));
      // Delete the previous upload unless it belongs to the saved child (it is removed after saving instead).
      if (old && !Object.values(student?.photos ?? {}).includes(old)) void deletePhotos([old]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function validate(s: number): string {
    if (s === 0 && f.fullName.trim().length < 2) return "Please enter the child's full name";
    if (s === 1) {
      if (!f.dateOfBirth) return "Please choose the day, month and year of birth";
      if (f.dateOfBirth > new Date().toISOString().slice(0, 10)) return "Date of birth cannot be in the future";
      if (f.dateOfBirth < `${MIN_BIRTH_YEAR}-01-01`) return `Please choose a year from ${MIN_BIRTH_YEAR} onwards`;
      if (!f.timeOfBirth && f.birthTimeAccuracy !== "UNKNOWN") return "Please enter the time of birth, or choose 'Not known'";
      if (!f.birthPlace.trim()) return "Please enter the place of birth";
      if (!Number.isFinite(f.latitude) || Math.abs(f.latitude) > 66 || !Number.isFinite(f.longitude) || Math.abs(f.longitude) > 180) return "Please check the latitude and longitude";
      if (!Number.isFinite(f.tzOffset) || Math.abs(f.tzOffset) > 14) return "Please check the time zone";
    }
    if (s === 2) {
      const missing = PHOTO_FIELDS.filter((p) => !photos[p.key]);
      if (missing.length) return `Please upload: ${missing.map((m) => m.label).join(", ")}`;
    }
    return "";
  }

  function goTo(target: number) {
    // Moving back is always allowed; moving forward requires the current step to be valid.
    if (target > step) {
      for (let i = step; i < target; i++) {
        const err = validate(i);
        if (err) { setStep(i); setError(err); return; }
      }
    }
    setError("");
    setStep(target);
    setMaxStep((m) => Math.max(m, target));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Deletes photos uploaded in this form that were never saved to the child. */
  function discardUnsavedPhotos() {
    const saved = new Set(Object.values(student?.photos ?? {}));
    void deletePhotos(Object.values(photos).filter((r) => r && !saved.has(r)));
  }

  function startOver() {
    if (!window.confirm(editing ? "Discard your unsaved changes?" : "Clear this form and start again?")) return;
    discardUnsavedPhotos();
    clearDraft(user.id, draftId);
    setResetKey((k) => k + 1);
    setF(student ? fromStudent(student) : EMPTY);
    setPhotos({ ...(student?.photos ?? {}) });
    setStep(0);
    setMaxStep(editing ? 3 : 0);
    setShowRestored(false);
    setError("");
  }

  function submit() {
    for (let i = 0; i < 3; i++) {
      const err = validate(i);
      if (err) {
        setStep(i);
        setError(`${STEPS[i].label}: ${err}`);
        return;
      }
    }
    setSaving(true);
    try {
      const { cityIndex: _c, ...data } = f;
      // Unknown birth time: use local noon (the astrologer relies more on Prashna Kundali).
      const details = { ...data, fullName: data.fullName.trim(), timeOfBirth: data.timeOfBirth || "12:00", photos };
      submitted.current = true;
      if (student) {
        updateStudent(student.id, details);
        clearDraft(user.id, draftId);
        router.push(`/students/${student.id}?saved=1`);
      } else {
        const s = addStudent(user.id, details);
        clearDraft(user.id, draftId);
        router.push(`/students/${s.id}/meeting?new=1`);
      }
    } catch (e) {
      submitted.current = false;
      setSaving(false);
      setError((e as Error).message);
    }
  }

  const photoCount = PHOTO_FIELDS.filter((p) => photos[p.key]).length;

  return (
    <div className="card" style={{ padding: 32 }}>
      {showRestored && restored && (
        <div className="alert alert-info flex between flex-wrap">
          <span>💾 We restored your unsaved {editing ? "changes" : "form"} from {new Date(restored.savedAt).toLocaleString("en-IN")}.</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={startOver}>{editing ? "Discard changes" : "Start over"}</button>
        </div>
      )}

      <div className="stepper">
        {STEPS.map((s, i) => (
          <button
            type="button" key={s.label} disabled={i > maxStep} onClick={() => goTo(i)}
            className={`s ${i === step ? "active" : ""} ${i < step || (i <= maxStep && i !== step && !validate(i)) ? "done" : ""}`}
          >
            <div className="dot">{i !== step && i <= maxStep && !validate(i) ? "✓" : s.icon}</div>
            {s.label}
          </button>
        ))}
      </div>

      {error && <div ref={errorRef} className="alert alert-error" role="alert">⚠️ {error}</div>}

      {/* All steps stay mounted, so nothing typed is lost when moving between steps. */}
      <div hidden={step !== 0}>
        <div className="field">
          <label htmlFor="sf-name">Child's full name *</label>
          <input id="sf-name" className="input" value={f.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="e.g. Aarav Sharma" maxLength={80} />
        </div>
        <div className="field">
          <label>Gender *</label>
          <div className="radio-pills">
            {[["MALE", "👦 Boy"], ["FEMALE", "👧 Girl"], ["OTHER", "🧒 Other"]].map(([v, l]) => (
              <label key={v}><input type="radio" name="gender" checked={f.gender === v} onChange={() => set("gender", v as Details["gender"])} /><span>{l}</span></label>
            ))}
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="sf-class">Current class *</label>
            <select id="sf-class" className="select" value={f.currentClass} onChange={(e) => set("currentClass", e.target.value)}>
              {CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sf-school">School / college</label>
            <input id="sf-school" className="input" value={f.schoolName} onChange={(e) => set("schoolName", e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="sf-subjects">Favourite subjects</label>
          <input id="sf-subjects" className="input" value={f.favouriteSubjects} onChange={(e) => set("favouriteSubjects", e.target.value)} placeholder="e.g. Maths, Science, Drawing" />
        </div>
        <div className="field">
          <label htmlFor="sf-hobbies">Hobbies & interests</label>
          <input id="sf-hobbies" className="input" value={f.hobbies} onChange={(e) => set("hobbies", e.target.value)} placeholder="e.g. Cricket, coding, dancing" />
        </div>
      </div>

      <div hidden={step !== 1}>
        <div className="alert alert-info small">🪐 The exact time of birth gives the most accurate Kundali. Please use the time on the birth certificate.</div>
        <div className="field-row">
          <div className="field">
            <label>Date of birth *</label>
            <DateOfBirthSelect key={resetKey} value={f.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} />
          </div>
          <div className="field">
            <label htmlFor="sf-time">Time of birth *</label>
            <input id="sf-time" type="time" className="input" value={f.timeOfBirth} disabled={f.birthTimeAccuracy === "UNKNOWN"} onChange={(e) => set("timeOfBirth", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>How sure are you about the birth time?</label>
          <div className="radio-pills">
            {[["EXACT", "Exact (certificate)"], ["APPROX", "Approximate"], ["UNKNOWN", "Not known"]].map(([v, l]) => (
              <label key={v}><input type="radio" name="accuracy" checked={f.birthTimeAccuracy === v} onChange={() => set("birthTimeAccuracy", v as Details["birthTimeAccuracy"])} /><span>{l}</span></label>
            ))}
          </div>
          {f.birthTimeAccuracy === "UNKNOWN" && <span className="hint">No problem. Our astrologer will rely more on Prashna Kundali, palmistry and face reading.</span>}
        </div>
        <div className="field">
          <label htmlFor="sf-city">Place of birth *</label>
          <select id="sf-city" className="select" value={f.cityIndex} onChange={(e) => chooseCity(e.target.value)}>
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}, {c.region}</option>)}
            <option value="custom">Other place (enter manually)</option>
          </select>
        </div>
        {f.cityIndex === "custom" && (
          <>
            <div className="field">
              <label htmlFor="sf-place">Town / city name *</label>
              <input id="sf-place" className="input" value={f.birthPlace} onChange={(e) => set("birthPlace", e.target.value)} placeholder="e.g. Hisar, Haryana" />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="sf-lat">Latitude (N +, S −)</label>
                <input id="sf-lat" type="number" step="0.0001" className="input" value={Number.isFinite(f.latitude) ? f.latitude : ""} onChange={(e) => set("latitude", e.target.value === "" ? NaN : Number(e.target.value))} />
              </div>
              <div className="field">
                <label htmlFor="sf-lon">Longitude (E +, W −)</label>
                <input id="sf-lon" type="number" step="0.0001" className="input" value={Number.isFinite(f.longitude) ? f.longitude : ""} onChange={(e) => set("longitude", e.target.value === "" ? NaN : Number(e.target.value))} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="sf-tz">Time zone (hours from UTC)</label>
              <input id="sf-tz" type="number" step="0.25" className="input" value={Number.isFinite(f.tzOffset) ? f.tzOffset : ""} onChange={(e) => set("tzOffset", e.target.value === "" ? NaN : Number(e.target.value))} />
              <span className="hint">India = 5.5. Find the coordinates on Google Maps (right-click the place).</span>
            </div>
          </>
        )}
      </div>

      <div hidden={step !== 2}>
        <div className="alert alert-warn small">
          📸 All 5 photos are required for the palmistry and face-reading case study. Use daylight and a plain background, and keep the whole hand in the frame.
        </div>
        <div className="upload-grid">
          {PHOTO_FIELDS.map((p) => (
            <label key={p.key} className={`upload-tile ${photos[p.key] ? "has-file" : ""}`}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { onPhoto(p.key, e.target.files?.[0]); e.target.value = ""; }} disabled={busy !== null} />
              {busy === p.key ? (
                <span className="muted">Saving photo…</span>
              ) : photos[p.key] ? (
                <>
                  <Photo photo={photos[p.key]} alt={p.label} fallback={<span className="muted">Loading…</span>} />
                  <span className="u-badge">✓ {p.label}. Tap to change</span>
                </>
              ) : (
                <>
                  <span className="u-icon">{p.icon}</span>
                  <span className="u-label">{p.label}</span>
                  <span className="u-hint">{p.hint}</span>
                </>
              )}
            </label>
          ))}
        </div>
        <p className="small muted mt-2">{photoCount} of 5 photos added · photos are saved as soon as you add them</p>
      </div>

      <div hidden={step !== 3}>
        <p className="muted">Parents know the child best. Your answers help the astrologer write a better case study.</p>
        <div className="field">
          <label htmlFor="sf-goals">What are your hopes or worries about your child's career?</label>
          <textarea id="sf-goals" className="textarea" value={f.parentGoals} onChange={(e) => set("parentGoals", e.target.value)} placeholder="e.g. We are confused between Science and Commerce after Class 10…" />
        </div>
        <div className="field">
          <label htmlFor="sf-ach">Achievements (academics, sports, arts)</label>
          <textarea id="sf-ach" className="textarea" value={f.achievements} onChange={(e) => set("achievements", e.target.value)} placeholder="Optional" />
        </div>
        <div className="field">
          <label htmlFor="sf-health">Health or learning notes</label>
          <textarea id="sf-health" className="textarea" value={f.healthNotes} onChange={(e) => set("healthNotes", e.target.value)} placeholder="Optional, e.g. attention difficulties, allergies" />
        </div>
        <div className="card card-soft small">
          <b>Summary:</b> {f.fullName || "—"} · {f.currentClass} · Born {f.dateOfBirth || "—"} at {f.birthTimeAccuracy === "UNKNOWN" ? "unknown time" : f.timeOfBirth || "—"}, {f.birthPlace || "—"} · {photoCount}/5 photos
        </div>
      </div>

      <div className="flex between mt-3 flex-wrap">
        <button type="button" className="btn btn-outline" disabled={step === 0 || saving} onClick={() => goTo(step - 1)}>← Back</button>
        <span className="small muted">💾 Saved as you type</span>
        {step < 3 ? (
          <button type="button" className="btn btn-primary" disabled={busy !== null} onClick={() => goTo(step + 1)}>Continue →</button>
        ) : (
          <button type="button" className="btn btn-primary" disabled={saving || busy !== null} onClick={submit}>
            {saving ? <><span className="spinner" /> Saving…</> : editing ? "💾 Save changes" : "Submit form & book Google Meet →"}
          </button>
        )}
      </div>
      {editing && (
        <div className="flex mt-2" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => { discardUnsavedPhotos(); clearDraft(user.id, draftId); submitted.current = true; router.push(`/students/${student!.id}`); }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
