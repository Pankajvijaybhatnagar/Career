"use client";
/**
 * Frontend-only data store (browser localStorage).
 * Every function here is the single place a real backend/API will plug in later:
 * replace the body of each function with a fetch() call and keep the same signatures.
 */
import { useSyncExternalStore } from "react";
import { isPaid, planOf, type PlanId } from "./plans";
import { castPrashna, type PrashnaCategory, type PrashnaReading } from "./astro/prashna";
import { PHOTO_REF_PREFIX, allPhotoIds, blobToDataUrl, clearAllPhotos, dataUrlToBlob, deletePhotos, getPhotoBlob, putPhoto } from "./photoStore";

export type Role = "PARENT" | "ADMIN";
export type User = { id: string; name: string; email: string; phone: string; password: string; role: Role; createdAt: string };

export type PhotoKey = "facePhoto" | "leftPalmFront" | "leftPalmBack" | "rightPalmFront" | "rightPalmBack";

export type StudentStatus = "REGISTERED" | "PAID" | "UNDER_REVIEW" | "REPORT_READY" | "COUNSELLED";

export type CaseStudy = {
  palmistryNotes: string;
  faceReadingNotes: string;
  astrologerSummary: string;
  recommendedStream: string;
  remedies: string;
  parentGuidance: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

export type Question = {
  id: string;
  category: PrashnaCategory;
  question: string;
  askedAt: string;
  place: string;
  reading: PrashnaReading;
  expertAnswer?: string;
  answeredAt?: string;
};

export type Session = {
  id: string;
  preferredDate: string;
  preferredTime: string;
  mode: "GOOGLE_MEET" | "VIDEO" | "PHONE" | "IN_PERSON";
  durationMin?: number;
  notes: string;
  status: "REQUESTED" | "CONFIRMED" | "DONE" | "CANCELLED";
  meetingLink?: string;
  createdAt: string;
};

export type Payment = { id: string; plan: PlanId; amount: number; paidAt: string; method: string };

export type Student = {
  id: string;
  parentId: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  timeOfBirth: string;
  birthTimeAccuracy: "EXACT" | "APPROX" | "UNKNOWN";
  birthPlace: string;
  latitude: number;
  longitude: number;
  tzOffset: number;
  currentClass: string;
  schoolName: string;
  favouriteSubjects: string;
  hobbies: string;
  achievements: string;
  parentGoals: string;
  healthNotes: string;
  photos: Partial<Record<PhotoKey, string>>; // "idb:<id>" references to photos kept in IndexedDB
  plan: PlanId;
  status: StudentStatus;
  payments: Payment[];
  caseStudy?: CaseStudy;
  questions: Question[];
  sessions: Session[];
  createdAt: string;
};

type DB = { users: User[]; students: Student[]; currentUserId: string | null };

const KEY = "vj_demo_db_v1";
const EMPTY: DB = { users: [], students: [], currentUserId: null };
export const DEMO_ADMIN = { email: "astrologer@demo.com", password: "demo1234" };

let cache: DB | null = null;
const listeners = new Set<() => void>();

function seed(db: DB): DB {
  if (!db.users.some((u) => u.email === DEMO_ADMIN.email)) {
    db.users.push({
      id: "admin", name: "Chief Astrologer", email: DEMO_ADMIN.email, phone: "", password: DEMO_ADMIN.password,
      role: "ADMIN", createdAt: new Date().toISOString(),
    });
  }
  return db;
}

function load(): DB {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    cache = seed(raw ? (JSON.parse(raw) as DB) : { ...EMPTY, users: [], students: [] });
  } catch {
    cache = seed({ users: [], students: [], currentUserId: null });
  }
  void migrateLegacyPhotos();
  return cache;
}

/** Writes to storage FIRST; the in-memory copy only changes if the write succeeded. */
function save(next: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    throw new Error("Browser storage is full, so this could not be saved. Go to My Profile → Data & storage to free up space.");
  }
  cache = next;
  listeners.forEach((l) => l());
}

/** Old versions stored photos inside localStorage as data: URLs. Move them to IndexedDB once. */
let migrating = false;
async function migrateLegacyPhotos() {
  if (migrating || typeof window === "undefined" || !cache) return;
  const legacy = cache.students.flatMap((s) =>
    Object.entries(s.photos).filter(([, v]) => v?.startsWith("data:")).map(([k, v]) => ({ id: s.id, k, v: v! })),
  );
  if (!legacy.length) return;
  migrating = true;
  try {
    const moved: { id: string; k: string; ref: string }[] = [];
    for (const p of legacy) moved.push({ id: p.id, k: p.k, ref: await putPhoto(await dataUrlToBlob(p.v)) });
    mutate((db) => {
      for (const m of moved) {
        const s = db.students.find((x) => x.id === m.id);
        if (s) s.photos[m.k as PhotoKey] = m.ref;
      }
    });
  } catch {
    // Leave the old photos in place; they still display.
  } finally {
    migrating = false;
  }
}

function mutate(fn: (db: DB) => void) {
  const db: DB = structuredClone(load());
  fn(db);
  save(db);
  return db;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// ---------------- React hooks ----------------
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; cb(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

/** Whole-store hook. `ready` is false during server render / first paint. */
export function useDB() {
  const db = useSyncExternalStore(subscribe, load, () => EMPTY);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  return { db, ready };
}

export function useAuth() {
  const { db, ready } = useDB();
  const user = db.users.find((u) => u.id === db.currentUserId) ?? null;
  return { user, ready };
}

// ---------------- Auth ----------------
export function register(input: { name: string; email: string; phone: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (input.name.trim().length < 2) throw new Error("Please enter your full name");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Please enter a valid email");
  if (!/^[+0-9 ]{10,15}$/.test(input.phone.trim())) throw new Error("Please enter a valid mobile number");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters");
  if (load().users.some((u) => u.email === email)) throw new Error("An account with this email already exists. Please log in.");
  const user: User = { id: uid(), name: input.name.trim(), email, phone: input.phone.trim(), password: input.password, role: "PARENT", createdAt: new Date().toISOString() };
  mutate((db) => { db.users.push(user); db.currentUserId = user.id; });
  return user;
}

export function login(email: string, password: string) {
  const u = load().users.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
  if (!u) throw new Error("Incorrect email or password");
  mutate((db) => { db.currentUserId = u.id; });
  return u;
}

export function logout() {
  mutate((db) => { db.currentUserId = null; });
}

export function updateProfile(userId: string, data: { name: string; phone: string; password?: string }) {
  mutate((db) => {
    const u = db.users.find((x) => x.id === userId);
    if (!u) return;
    u.name = data.name.trim() || u.name;
    u.phone = data.phone.trim();
    if (data.password) {
      if (data.password.length < 8) throw new Error("Password must be at least 8 characters");
      u.password = data.password;
    }
  });
}

// ---------------- Students ----------------
export type NewStudent = Omit<Student, "id" | "parentId" | "plan" | "status" | "payments" | "questions" | "sessions" | "createdAt" | "caseStudy">;

export function addStudent(parentId: string, data: NewStudent) {
  const s: Student = {
    ...data, id: uid(), parentId, plan: "FREE", status: "REGISTERED",
    payments: [], questions: [], sessions: [], createdAt: new Date().toISOString(),
  };
  mutate((db) => { db.students.push(s); });
  return s;
}

export function updateStudent(id: string, patch: Partial<Student>) {
  const before = load().students.find((x) => x.id === id);
  mutate((db) => {
    const s = db.students.find((x) => x.id === id);
    if (s) Object.assign(s, patch);
  });
  // Remove photos that were replaced.
  if (before && patch.photos) {
    const kept = new Set(Object.values(patch.photos));
    void deletePhotos(Object.values(before.photos).filter((r) => r && !kept.has(r)));
  }
}

export function deleteStudent(id: string) {
  const s = load().students.find((x) => x.id === id);
  mutate((db) => { db.students = db.students.filter((x) => x.id !== id); });
  if (s) void deletePhotos(Object.values(s.photos));
}

/** Demo payment. Replace with a Razorpay/Stripe checkout when the backend exists. */
export function payForPlan(studentId: string, plan: PlanId, method: string) {
  mutate((db) => {
    const s = db.students.find((x) => x.id === studentId);
    if (!s) return;
    const already = planOf(s.plan).price;
    const amount = Math.max(planOf(plan).price - already, 0);
    s.payments.push({ id: "pay_" + uid(), plan, amount, paidAt: new Date().toISOString(), method });
    s.plan = plan;
    if (s.status === "REGISTERED") s.status = "PAID";
  });
}

export function askQuestion(studentId: string, input: { category: PrashnaCategory; question: string; lat: number; lon: number; tz: number; place: string }) {
  const s = load().students.find((x) => x.id === studentId);
  if (!s) throw new Error("Student not found");
  if (s.questions.length >= planOf(s.plan).prashnaQuestions) throw new Error("Question limit reached for this plan. Please upgrade.");
  if (input.question.trim().length < 10) throw new Error("Please write your question in a little more detail");
  const { reading } = castPrashna(input.category, input.lat, input.lon, input.tz);
  const q: Question = { id: uid(), category: input.category, question: input.question.trim(), askedAt: new Date().toISOString(), place: input.place, reading };
  mutate((db) => { db.students.find((x) => x.id === studentId)!.questions.unshift(q); });
  return q;
}

// ---------------- Google Meet counselling (30 min, 2–3 days after the form) ----------------
export const MEETING_MINUTES = 30;
export const MEETING_TIMES = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The meeting days offered: 2 and 3 days after the form was submitted (or after today, if that has passed). Sundays are skipped. */
export function meetingDays(submittedAt: string, now = new Date()) {
  const base = new Date(Math.max(new Date(submittedAt).getTime(), now.getTime()));
  const days: string[] = [];
  let offset = 2;
  while (days.length < 2) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
    if (d.getDay() !== 0) days.push(ymd(d));
    offset++;
  }
  return days;
}

/** Slots already taken by any child (active meetings only). */
export function takenSlots(db: DB) {
  return new Set(
    db.students.flatMap((s) => s.sessions.filter((x) => x.status !== "CANCELLED").map((x) => `${x.preferredDate} ${x.preferredTime}`)),
  );
}

export function activeMeeting(s: Student) {
  return s.sessions.find((x) => x.mode === "GOOGLE_MEET" && (x.status === "REQUESTED" || x.status === "CONFIRMED"));
}

export function bookMeeting(studentId: string, date: string, time: string, notes: string) {
  const db = load();
  const s = db.students.find((x) => x.id === studentId);
  if (!s) throw new Error("Student not found");
  if (!isPaid(s.plan)) throw new Error("Please pay the full fee to book the Google Meet session");
  if (activeMeeting(s)) throw new Error("A meeting is already booked. Cancel it first to choose another time.");
  const used = s.sessions.filter((x) => x.status !== "CANCELLED").length;
  if (used >= planOf(s.plan).counsellingSessions) throw new Error("No counselling sessions left on this plan");
  if (!meetingDays(s.createdAt).includes(date) || !MEETING_TIMES.includes(time)) throw new Error("Please choose one of the available slots");
  if (takenSlots(db).has(`${date} ${time}`)) throw new Error("Sorry, this slot was just booked. Please choose another.");
  mutate((d) => {
    d.students.find((x) => x.id === studentId)!.sessions.unshift({
      id: uid(), preferredDate: date, preferredTime: time, mode: "GOOGLE_MEET", durationMin: MEETING_MINUTES,
      notes, status: "REQUESTED", createdAt: new Date().toISOString(),
    });
  });
}

/** "Add to Google Calendar" link for a meeting (times are India time, IST). */
export function googleCalendarUrl(s: Student, x: Session) {
  const start = new Date(`${x.preferredDate}T${x.preferredTime}:00+05:30`);
  const end = new Date(start.getTime() + (x.durationMin ?? MEETING_MINUTES) * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `Career counselling for ${s.fullName} (Google Meet)`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `30-minute astrology career counselling session.\n${x.meetingLink ? `Join: ${x.meetingLink}` : "The Google Meet link will be shared by the astrologer."}`,
    location: x.meetingLink || "Google Meet",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function formatSlot(date: string, time: string) {
  const d = new Date(`${date}T${time}:00`);
  return `${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}, ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
}

// ---------------- Astrologer (admin) ----------------
export function saveCaseStudy(studentId: string, cs: CaseStudy, reviewer: string, status: StudentStatus) {
  mutate((db) => {
    const s = db.students.find((x) => x.id === studentId);
    if (!s) return;
    s.caseStudy = { ...cs, reviewedBy: reviewer, reviewedAt: new Date().toISOString() };
    s.status = status;
  });
}

export function answerQuestion(studentId: string, qid: string, answer: string) {
  mutate((db) => {
    const q = db.students.find((x) => x.id === studentId)?.questions.find((x) => x.id === qid);
    if (q) { q.expertAnswer = answer; q.answeredAt = new Date().toISOString(); }
  });
}

export function updateSession(studentId: string, sid: string, patch: Partial<Session>) {
  mutate((db) => {
    const ss = db.students.find((x) => x.id === studentId)?.sessions.find((x) => x.id === sid);
    if (ss) Object.assign(ss, patch);
  });
}

/** Compresses a photo in the browser (max 1200 px, JPEG) so reports load fast. */
export function compressImage(file: File, maxSide = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error("Please choose a JPG, PNG or WEBP photo"));
    if (file.size > 15 * 1024 * 1024) return reject(new Error("Photo must be smaller than 15 MB"));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process this image"))), "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read this image. Please try another photo.")); };
    img.src = url;
  });
}

/** Compresses and stores an uploaded photo; returns its reference. */
export async function saveUploadedPhoto(file: File): Promise<string> {
  return putPhoto(await compressImage(file));
}

// ---------------- Form drafts (so a refresh never loses what was typed) ----------------
const draftKey = (userId: string, studentId = "new") => `vj_draft_${userId}_${studentId}`;

export function loadDraft<T>(userId: string, studentId?: string): T | null {
  try {
    const raw = localStorage.getItem(draftKey(userId, studentId));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveDraft(userId: string, data: unknown, studentId?: string) {
  try { localStorage.setItem(draftKey(userId, studentId), JSON.stringify(data)); } catch {}
}

export function clearDraft(userId: string, studentId?: string) {
  try { localStorage.removeItem(draftKey(userId, studentId)); } catch {}
}

// ---------------- Data management (backup / restore / reset) ----------------
function draftPhotoRefs() {
  return Object.keys(localStorage).filter((k) => k.startsWith("vj_draft_")).flatMap((k) => {
    try { return Object.values((JSON.parse(localStorage.getItem(k) || "{}").photos ?? {}) as Record<string, string>); } catch { return []; }
  });
}

export async function storageUsage() {
  const localBytes = (localStorage.getItem(KEY) || "").length * 2;
  const used = new Set([...load().students.flatMap((s) => Object.values(s.photos)), ...draftPhotoRefs()]);
  const ids = await allPhotoIds();
  let quota: number | undefined, usage: number | undefined;
  try { const e = await navigator.storage.estimate(); quota = e.quota; usage = e.usage; } catch {}
  return { localBytes, photos: ids.length, unusedPhotos: ids.filter((i) => !used.has(i)).length, quota, usage };
}

/** Deletes photos not linked to any child or open form (e.g. replaced or abandoned uploads). */
export async function cleanUnusedPhotos() {
  const used = new Set([...load().students.flatMap((s) => Object.values(s.photos)), ...draftPhotoRefs()]);
  const unused = (await allPhotoIds()).filter((i) => !used.has(i));
  await deletePhotos(unused);
  return unused.length;
}

/** A single JSON file with all accounts, children and photos. */
export async function exportBackup() {
  const db = structuredClone(load());
  for (const s of db.students) {
    for (const [k, ref] of Object.entries(s.photos)) {
      if (ref?.startsWith(PHOTO_REF_PREFIX)) {
        const b = await getPhotoBlob(ref);
        s.photos[k as PhotoKey] = b ? await blobToDataUrl(b) : undefined;
      }
    }
  }
  return JSON.stringify({ app: "vidya-jyotish", version: 1, exportedAt: new Date().toISOString(), db });
}

export async function importBackup(json: string) {
  let parsed: { app?: string; db?: DB };
  try { parsed = JSON.parse(json); } catch { throw new Error("This is not a valid backup file"); }
  if (parsed.app !== "vidya-jyotish" || !parsed.db?.users || !parsed.db?.students) throw new Error("This is not a Vidya Jyotish backup file");
  const db = parsed.db;
  for (const s of db.students) {
    for (const [k, v] of Object.entries(s.photos)) {
      if (v?.startsWith("data:")) s.photos[k as PhotoKey] = await putPhoto(await dataUrlToBlob(v));
    }
  }
  const current = load().currentUserId;
  save(seed({ ...db, currentUserId: db.users.some((u) => u.id === current) ? current : null }));
  return { users: db.users.length, students: db.students.length };
}

/** Removes every account, child, photo and draft from this browser. */
export async function resetAllData() {
  Object.keys(localStorage).filter((k) => k.startsWith("vj_")).forEach((k) => localStorage.removeItem(k));
  await clearAllPhotos();
  cache = null;
  listeners.forEach((l) => l());
}

export const STATUS_LABEL: Record<StudentStatus, string> = {
  REGISTERED: "Registered – payment pending",
  PAID: "Paid – awaiting astrologer review",
  UNDER_REVIEW: "Case study in progress",
  REPORT_READY: "Report ready",
  COUNSELLED: "Counselling completed",
};

export const PHOTO_FIELDS: { key: PhotoKey; label: string; hint: string; icon: string }[] = [
  { key: "facePhoto", label: "Face photo (front)", hint: "Look straight at the camera in good light, no glasses or cap", icon: "🙂" },
  { key: "leftPalmFront", label: "Left hand – palm", hint: "Open palm, fingers together, whole hand visible", icon: "✋" },
  { key: "leftPalmBack", label: "Left hand – back", hint: "Back of the hand with nails visible", icon: "🤚" },
  { key: "rightPalmFront", label: "Right hand – palm", hint: "Open palm, fingers together, whole hand visible", icon: "✋" },
  { key: "rightPalmBack", label: "Right hand – back", hint: "Back of the hand with nails visible", icon: "🤚" },
];

export function ageOf(dob: string, now = new Date()) {
  const d = new Date(dob);
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
