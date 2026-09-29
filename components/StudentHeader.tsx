"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ageOf, type Student } from "@/lib/store";
import { isPaid, planOf } from "@/lib/plans";
import Photo from "./Photo";

export default function StudentHeader({ s }: { s: Student }) {
  const path = usePathname();
  const base = `/students/${s.id}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/meeting`, label: "🎥 Google Meet" },
    { href: `${base}/report`, label: "22-page Report" },
    { href: `${base}/prashna`, label: "Prashna Kundali" },
    { href: `${base}/checkout`, label: isPaid(s.plan) ? "Plan" : "Unlock full report" },
  ];
  return (
    <>
      <section className="page-head no-print">
        <div className="container flex flex-wrap between">
          <div className="flex">
            <Photo
              photo={s.photos.facePhoto} className="student-photo" style={{ width: 76, height: 76, border: "3px solid #ffffff55" }}
              fallback={<div className="student-photo" style={{ width: 76, height: 76 }}>🧒</div>}
            />
            <div>
              <h1>{s.fullName}</h1>
              <p>{s.currentClass} · Age {ageOf(s.dateOfBirth)} · Born {s.dateOfBirth}, {s.birthPlace}</p>
            </div>
          </div>
          <span className={`badge ${s.plan === "PREMIUM" ? "badge-premium" : isPaid(s.plan) ? "badge-paid" : "badge-free"}`} style={{ fontSize: ".9rem", padding: "8px 14px" }}>
            {planOf(s.plan).name}
          </span>
        </div>
      </section>
      <div className="container no-print" style={{ marginTop: -36, position: "relative" }}>
        <div className="card" style={{ padding: "4px 20px 0" }}>
          <nav className="tabs" style={{ marginBottom: 0, borderBottom: 0 }}>
            {tabs.map((t) => (
              <Link key={t.href} href={t.href} className={path === t.href ? "active" : ""}>{t.label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
