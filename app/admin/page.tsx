"use client";
import { useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/Guard";
import { STATUS_LABEL, ageOf, formatSlot, useDB, type StudentStatus } from "@/lib/store";
import { PLANS, formatINR, isPaid } from "@/lib/plans";

export default function AdminPage() {
  const { db } = useDB();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | StudentStatus>("");
  const [plan, setPlan] = useState("");

  return (
    <RequireAuth admin>
      {() => {
        const all = [...db.students].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const parents = new Map(db.users.map((u) => [u.id, u]));
        const list = all.filter((s) => {
          const p = parents.get(s.parentId);
          const text = `${s.fullName} ${p?.name} ${p?.email} ${p?.phone} ${s.birthPlace}`.toLowerCase();
          return (!q || text.includes(q.toLowerCase())) && (!status || s.status === status) && (!plan || s.plan === plan);
        });
        const revenue = all.flatMap((s) => s.payments).reduce((x, p) => x + p.amount, 0);
        const pendingReview = all.filter((s) => isPaid(s.plan) && (s.status === "PAID" || s.status === "UNDER_REVIEW")).length;
        const pendingQ = all.flatMap((s) => (isPaid(s.plan) ? s.questions.filter((x) => !x.expertAnswer) : [])).length;
        const pendingSessions = all.flatMap((s) => s.sessions.filter((x) => x.status === "REQUESTED")).length;
        const upcoming = all
          .flatMap((s) => s.sessions.filter((x) => x.status === "REQUESTED" || x.status === "CONFIRMED").map((x) => ({ s, x })))
          .sort((a, b) => `${a.x.preferredDate} ${a.x.preferredTime}`.localeCompare(`${b.x.preferredDate} ${b.x.preferredTime}`));

        return (
          <>
            <section className="page-head">
              <div className="container">
                <h1>Astrologer Panel 🔭</h1>
                <p>Review profiles, write case studies, answer Prashna questions and manage counselling.</p>
              </div>
            </section>
            <div className="container page-body">
              <div className="grid grid-4 mb-2">
                <div className="card"><div className="small muted">Total profiles</div><b style={{ fontSize: "1.8rem" }}>{all.length}</b></div>
                <div className="card"><div className="small muted">Awaiting case study</div><b style={{ fontSize: "1.8rem", color: "var(--saffron-deep)" }}>{pendingReview}</b></div>
                <div className="card"><div className="small muted">Unanswered questions / session requests</div><b style={{ fontSize: "1.8rem" }}>{pendingQ} / {pendingSessions}</b></div>
                <div className="card"><div className="small muted">Revenue (demo)</div><b style={{ fontSize: "1.8rem", color: "var(--green)" }}>{formatINR(revenue)}</b></div>
              </div>

              <div className="card mb-2">
                <h3>🎥 Upcoming Google Meet sessions ({upcoming.length})</h3>
                {upcoming.length === 0 ? (
                  <p className="muted small mb-0">No meetings booked yet.</p>
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>When (IST)</th><th>Child</th><th>Parent</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {upcoming.map(({ s, x }) => (
                          <tr key={x.id}>
                            <td><b>{formatSlot(x.preferredDate, x.preferredTime)}</b><div className="small muted">{x.durationMin ?? 30} min</div></td>
                            <td>{s.fullName}</td>
                            <td className="small">{parents.get(s.parentId)?.name}<div className="muted">{parents.get(s.parentId)?.phone}</div></td>
                            <td>{x.status === "CONFIRMED" ? <span className="badge badge-paid">Link sent</span> : <span className="badge badge-pending">Needs Meet link</span>}</td>
                            <td>
                              {x.meetingLink
                                ? <a href={x.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Join</a>
                                : <Link href={`/admin/students/${s.id}`} className="btn btn-secondary btn-sm">Add link</Link>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="flex flex-wrap mb-2">
                  <input className="input" style={{ flex: 2, minWidth: 200 }} placeholder="🔍 Search by child, parent, email, phone or city" value={q} onChange={(e) => setQ(e.target.value)} />
                  <select className="select" style={{ flex: 1, minWidth: 160 }} value={status} onChange={(e) => setStatus(e.target.value as StudentStatus | "")}>
                    <option value="">All statuses</option>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <select className="select" style={{ flex: 1, minWidth: 140 }} value={plan} onChange={(e) => setPlan(e.target.value)}>
                    <option value="">All plans</option>
                    {Object.values(PLANS).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                {list.length === 0 ? (
                  <div className="empty"><div className="big">📭</div><p className="muted">No profiles yet. Profiles registered by parents in this browser appear here.</p></div>
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Child</th><th>Parent</th><th>Birth</th><th>Plan</th><th>Status</th><th>Pending</th><th></th></tr></thead>
                      <tbody>
                        {list.map((s) => {
                          const p = parents.get(s.parentId);
                          const pq = s.questions.filter((x) => !x.expertAnswer).length;
                          const ps = s.sessions.filter((x) => x.status === "REQUESTED").length;
                          return (
                            <tr key={s.id}>
                              <td>
                                <div className="flex">
                                  {s.photos.facePhoto ? <img src={s.photos.facePhoto} alt="" className="student-photo" style={{ width: 40, height: 40, borderRadius: 10 }} /> : <div className="student-photo" style={{ width: 40, height: 40, fontSize: "1.1rem" }}>🧒</div>}
                                  <div><b>{s.fullName}</b><div className="small muted">{s.currentClass} · {ageOf(s.dateOfBirth)} yrs</div></div>
                                </div>
                              </td>
                              <td className="small">{p?.name}<div className="muted">{p?.phone}</div></td>
                              <td className="small">{s.dateOfBirth} {s.timeOfBirth}<div className="muted">{s.birthPlace}</div></td>
                              <td><span className={`badge ${s.plan === "PREMIUM" ? "badge-premium" : isPaid(s.plan) ? "badge-paid" : "badge-free"}`}>{PLANS[s.plan].name}</span></td>
                              <td className="small">{STATUS_LABEL[s.status]}</td>
                              <td className="small">{pq > 0 && <span className="badge badge-pending">{pq} Q</span>} {ps > 0 && <span className="badge badge-info">{ps} session</span>}</td>
                              <td><Link href={`/admin/students/${s.id}`} className="btn btn-secondary btn-sm">Review</Link></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        );
      }}
    </RequireAuth>
  );
}
