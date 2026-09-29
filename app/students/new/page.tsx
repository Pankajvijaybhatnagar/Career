"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/Guard";
import { CITIES } from "@/lib/cities";
import { PHOTO_FIELDS, addStudent, compressImage, type NewStudent, type PhotoKey } from "@/lib/store";

const STEPS = [
  { icon: "👧", label: "Child details" },
  { icon: "🪐", label: "Birth details" },
  { icon: "📸", label: "Photos" },
  { icon: "💬", label: "Parents' input" },
];

const CLASSES = ["Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "College – 1st year", "College – 2nd year+", "Dropped / Gap year"];

type Form = Omit<NewStudent, "photos"> & { cityIndex: string };

const initial: Form = {
  fullName: "", gender: "MALE", dateOfBirth: "", timeOfBirth: "", birthTimeAccuracy: "EXACT",
  birthPlace: "New Delhi, Delhi", latitude: 28.6139, longitude: 77.209, tzOffset: 5.5, cityIndex: "0",
  currentClass: "Class 9", schoolName: "", favouriteSubjects: "", hobbies: "", achievements: "", parentGoals: "", healthNotes: "",
};

export default function NewStudentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(initial);
  const [photos, setPhotos] = useState<Partial<Record<PhotoKey, string>>>({});
  const [busy, setBusy] = useState<PhotoKey | null>(null);
  const [error, setError] = useState("");

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  function chooseCity(idx: string) {
    set("cityIndex", idx);
    if (idx === "custom") return;
    const c = CITIES[Number(idx)];
    setF((x) => ({ ...x, cityIndex: idx, birthPlace: `${c.name}, ${c.region}`, latitude: c.lat, longitude: c.lon, tzOffset: c.tz }));
  }

  async function onPhoto(key: PhotoKey, file?: File) {
    if (!file) return;
    setError("");
    setBusy(key);
    try {
      const url = await compressImage(file);
      setPhotos((p) => ({ ...p, [key]: url }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function validate(s: number): string {
    if (s === 0) {
      if (f.fullName.trim().length < 2) return "Please enter the child's full name";
    }
    if (s === 1) {
      if (!f.dateOfBirth) return "Please enter the date of birth";
      if (f.dateOfBirth > new Date().toISOString().slice(0, 10)) return "Date of birth cannot be in the future";
      if (f.dateOfBirth < "1950-01-01") return "Please check the year of birth";
      if (!f.timeOfBirth && f.birthTimeAccuracy !== "UNKNOWN") return "Please enter the time of birth, or choose 'Not known'";
      if (!f.birthPlace.trim()) return "Please enter the place of birth";
      if (Math.abs(f.latitude) > 66 || Math.abs(f.longitude) > 180) return "Please check the latitude and longitude";
    }
    if (s === 2) {
      const missing = PHOTO_FIELDS.filter((p) => !photos[p.key]);
      if (missing.length) return `Please upload: ${missing.map((m) => m.label).join(", ")}`;
    }
    return "";
  }

  function next() {
    const err = validate(step);
    setError(err);
    if (!err) { setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  function submit(userId: string) {
    for (let i = 0; i < 3; i++) {
      const err = validate(i);
      if (err) { setStep(i); setError(err); return; }
    }
    try {
      const { cityIndex: _c, ...data } = f;
      // Unknown birth time: use local noon (the astrologer will rely on Prashna Kundali).
      const s = addStudent(userId, { ...data, timeOfBirth: data.timeOfBirth || "12:00", photos });
      router.push(`/students/${s.id}/meeting?new=1`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <RequireAuth>
      {(user) => (
        <>
          <section className="page-head">
            <div className="container container-narrow">
              <h1>Register your child ✨</h1>
              <p>This takes about 5 minutes. Keep the birth certificate and a phone camera ready.</p>
            </div>
          </section>
          <div className="container container-narrow page-body">
            <div className="card" style={{ padding: 32 }}>
              <div className="stepper">
                {STEPS.map((s, i) => (
                  <div key={s.label} className={`s ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                    <div className="dot">{i < step ? "✓" : s.icon}</div>
                    {s.label}
                  </div>
                ))}
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              {step === 0 && (
                <div>
                  <div className="field">
                    <label>Child's full name *</label>
                    <input className="input" value={f.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="e.g. Aarav Sharma" />
                  </div>
                  <div className="field">
                    <label>Gender *</label>
                    <div className="radio-pills">
                      {[["MALE", "👦 Boy"], ["FEMALE", "👧 Girl"], ["OTHER", "🧒 Other"]].map(([v, l]) => (
                        <label key={v}><input type="radio" checked={f.gender === v} onChange={() => set("gender", v as Form["gender"])} /><span>{l}</span></label>
                      ))}
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Current class *</label>
                      <select className="select" value={f.currentClass} onChange={(e) => set("currentClass", e.target.value)}>
                        {CLASSES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>School / college</label>
                      <input className="input" value={f.schoolName} onChange={(e) => set("schoolName", e.target.value)} placeholder="Optional" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Favourite subjects</label>
                    <input className="input" value={f.favouriteSubjects} onChange={(e) => set("favouriteSubjects", e.target.value)} placeholder="e.g. Maths, Science, Drawing" />
                  </div>
                  <div className="field">
                    <label>Hobbies & interests</label>
                    <input className="input" value={f.hobbies} onChange={(e) => set("hobbies", e.target.value)} placeholder="e.g. Cricket, coding, dancing" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <div className="alert alert-info small">🪐 The exact time of birth gives the most accurate Kundali. Please use the time on the birth certificate.</div>
                  <div className="field-row">
                    <div className="field">
                      <label>Date of birth *</label>
                      <input type="date" className="input" value={f.dateOfBirth} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set("dateOfBirth", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Time of birth *</label>
                      <input type="time" className="input" value={f.timeOfBirth} disabled={f.birthTimeAccuracy === "UNKNOWN"} onChange={(e) => set("timeOfBirth", e.target.value)} />
                    </div>
                  </div>
                  <div className="field">
                    <label>How sure are you about the birth time?</label>
                    <div className="radio-pills">
                      {[["EXACT", "Exact (certificate)"], ["APPROX", "Approximate"], ["UNKNOWN", "Not known"]].map(([v, l]) => (
                        <label key={v}><input type="radio" checked={f.birthTimeAccuracy === v} onChange={() => set("birthTimeAccuracy", v as Form["birthTimeAccuracy"])} /><span>{l}</span></label>
                      ))}
                    </div>
                    {f.birthTimeAccuracy === "UNKNOWN" && <span className="hint">No problem. Our astrologer will rely more on Prashna Kundali, palmistry and face reading.</span>}
                  </div>
                  <div className="field">
                    <label>Place of birth *</label>
                    <select className="select" value={f.cityIndex} onChange={(e) => chooseCity(e.target.value)}>
                      {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}, {c.region}</option>)}
                      <option value="custom">Other place (enter manually)</option>
                    </select>
                  </div>
                  {f.cityIndex === "custom" && (
                    <>
                      <div className="field">
                        <label>Town / city name *</label>
                        <input className="input" value={f.birthPlace} onChange={(e) => set("birthPlace", e.target.value)} placeholder="e.g. Hisar, Haryana" />
                      </div>
                      <div className="field-row">
                        <div className="field">
                          <label>Latitude (N +, S −)</label>
                          <input type="number" step="0.0001" className="input" value={f.latitude} onChange={(e) => set("latitude", Number(e.target.value))} />
                        </div>
                        <div className="field">
                          <label>Longitude (E +, W −)</label>
                          <input type="number" step="0.0001" className="input" value={f.longitude} onChange={(e) => set("longitude", Number(e.target.value))} />
                        </div>
                      </div>
                      <div className="field">
                        <label>Time zone (hours from UTC)</label>
                        <input type="number" step="0.25" className="input" value={f.tzOffset} onChange={(e) => set("tzOffset", Number(e.target.value))} />
                        <span className="hint">India = 5.5. Look up the coordinates on Google Maps (right-click the place).</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="alert alert-warn small">
                    📸 All 5 photos are required for the palmistry and face-reading case study. Use daylight, a plain background, and keep the whole hand in the frame.
                  </div>
                  <div className="upload-grid">
                    {PHOTO_FIELDS.map((p) => (
                      <label key={p.key} className={`upload-tile ${photos[p.key] ? "has-file" : ""}`}>
                        <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(e) => onPhoto(p.key, e.target.files?.[0])} />
                        {photos[p.key] ? (
                          <>
                            <img src={photos[p.key]} alt={p.label} />
                            <span className="u-badge">✓ {p.label}. Tap to change</span>
                          </>
                        ) : busy === p.key ? (
                          <span className="muted">Processing…</span>
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
                  <p className="small muted mt-2">{Object.keys(photos).length} of 5 photos added</p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="muted">Parents know the child best. Your answers help the astrologer write a better case study.</p>
                  <div className="field">
                    <label>What are your hopes or worries about your child's career?</label>
                    <textarea className="textarea" value={f.parentGoals} onChange={(e) => set("parentGoals", e.target.value)} placeholder="e.g. We are confused between Science and Commerce after Class 10…" />
                  </div>
                  <div className="field">
                    <label>Achievements (academics, sports, arts)</label>
                    <textarea className="textarea" value={f.achievements} onChange={(e) => set("achievements", e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="field">
                    <label>Health or learning notes</label>
                    <textarea className="textarea" value={f.healthNotes} onChange={(e) => set("healthNotes", e.target.value)} placeholder="Optional, e.g. attention difficulties, allergies" />
                  </div>
                  <div className="card card-soft small">
                    <b>Summary:</b> {f.fullName || "—"} · {f.currentClass} · Born {f.dateOfBirth || "—"} at {f.birthTimeAccuracy === "UNKNOWN" ? "unknown time" : f.timeOfBirth || "—"}, {f.birthPlace || "—"} · {Object.keys(photos).length}/5 photos
                  </div>
                </div>
              )}

              <div className="flex between mt-3">
                <button className="btn btn-outline" disabled={step === 0} onClick={() => { setError(""); setStep((s) => s - 1); }}>← Back</button>
                {step < 3 ? (
                  <button className="btn btn-primary" onClick={next}>Continue →</button>
                ) : (
                  <button className="btn btn-primary" onClick={() => submit(user.id)}>Submit form & book Google Meet →</button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </RequireAuth>
  );
}
