"use client";
import Link from "next/link";
import { RequireAuth } from "@/components/Guard";
import { STATUS_LABEL, ageOf, useDB } from "@/lib/store";
import { isPaid, planOf } from "@/lib/plans";
import UnlockButton from "@/components/UnlockButton";

export default function DashboardPage() {
  const { db } = useDB();
  return (
    <RequireAuth>
      {(user) => {
        const kids = db.students.filter((s) => s.parentId === user.id);
        const paid = kids.filter((k) => isPaid(k.plan)).length;
        const ready = kids.filter((k) => k.status === "REPORT_READY" || k.status === "COUNSELLED").length;
        return (
          <>
            <section className="page-head">
              <div className="container flex between flex-wrap">
                <div>
                  <h1>Namaste, {user.name.split(" ")[0]} 🙏</h1>
                  <p>Here are your children's profiles, reports and questions.</p>
                </div>
                <div className="flex flex-wrap">
                  <Link href="/sample-report" className="btn btn-ghost-light">📘 Sample report</Link>
                  <Link href="/students/new" className="btn btn-primary">+ Add a child</Link>
                </div>
              </div>
            </section>
            <div className="container page-body">
              <div className="grid grid-3 mb-2">
                <div className="card flex"><div className="icon-bubble">👧</div><div><b style={{ fontSize: "1.6rem" }}>{kids.length}</b><div className="small muted">Profiles</div></div></div>
                <div className="card flex"><div className="icon-bubble teal">✅</div><div><b style={{ fontSize: "1.6rem" }}>{paid}</b><div className="small muted">Full reports unlocked</div></div></div>
                <div className="card flex"><div className="icon-bubble violet">📘</div><div><b style={{ fontSize: "1.6rem" }}>{ready}</b><div className="small muted">Reviewed by astrologer</div></div></div>
              </div>

              {kids.length === 0 ? (
                <div className="card empty">
                  <div className="big">🌟</div>
                  <h2>Let's begin with your child</h2>
                  <p className="muted">Add your child's birth details and photos to see their Kundali instantly.</p>
                  <Link href="/students/new" className="btn btn-primary btn-lg">Register my child</Link>
                </div>
              ) : (
                <div className="grid grid-3">
                  {kids.map((s) => {
                    const plan = planOf(s.plan);
                    return (
                      <div key={s.id} className="card card-hover student-card">
                        <div className="top">
                          {s.photos.facePhoto ? <img src={s.photos.facePhoto} alt="" className="student-photo" /> : <div className="student-photo">🧒</div>}
                          <div>
                            <h3 className="mb-0">{s.fullName}</h3>
                            <div className="small muted">{s.currentClass} · Age {ageOf(s.dateOfBirth)}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap">
                          <span className={`badge ${s.plan === "PREMIUM" ? "badge-premium" : isPaid(s.plan) ? "badge-paid" : "badge-free"}`}>{plan.name}</span>
                          <span className="badge badge-info">{STATUS_LABEL[s.status]}</span>
                        </div>
                        <div className="small muted">
                          Questions used: {s.questions.length}/{plan.prashnaQuestions} · Report pages: {plan.reportPages}/22
                        </div>
                        <div className="flex flex-wrap" style={{ marginTop: "auto" }}>
                          <Link href={`/students/${s.id}`} className="btn btn-secondary btn-sm">Open profile</Link>
                          <Link href={`/students/${s.id}/report`} className="btn btn-outline btn-sm">Report</Link>
                          <Link href={`/students/${s.id}/meeting`} className="btn btn-outline btn-sm">🎥 Google Meet</Link>
                          {!isPaid(s.plan) && <UnlockButton studentId={s.id} className="btn btn-primary btn-sm">Unlock ₹1500</UnlockButton>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        );
      }}
    </RequireAuth>
  );
}
