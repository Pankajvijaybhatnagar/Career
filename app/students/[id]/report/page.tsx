"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { WithStudent } from "@/components/Guard";
import StudentHeader from "@/components/StudentHeader";
import Report from "@/components/Report";
import { useChart } from "@/lib/useChart";
import type { Student } from "@/lib/store";
import { isPaid, planOf } from "@/lib/plans";
import { REPORT_PAGE_TITLES } from "@/lib/report-pages";
import UnlockButton from "@/components/UnlockButton";

function ReportView({ s }: { s: Student }) {
  const { chart, analysis } = useChart(s);
  const plan = planOf(s.plan);
  return (
    <>
      <div className="report-toolbar">
        <div className="container flex between flex-wrap">
          <div className="flex flex-wrap">
            <b>{plan.reportPages} of 22 pages unlocked</b>
            <select className="select" style={{ width: "auto", padding: "6px 10px" }} onChange={(e) => document.getElementById(`page-${e.target.value}`)?.scrollIntoView({ behavior: "smooth" })} defaultValue="">
              <option value="" disabled>Jump to page…</option>
              {REPORT_PAGE_TITLES.slice(0, plan.reportPages).map((t, i) => <option key={t.title} value={i + 1}>{i + 1}. {t.title}</option>)}
            </select>
          </div>
          {isPaid(s.plan) ? (
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>🖨️ Download / Print PDF</button>
          ) : (
            <UnlockButton studentId={s.id} className="btn btn-primary btn-sm" goToReport={false}>Unlock all 22 pages – ₹1500</UnlockButton>
          )}
        </div>
      </div>
      {isPaid(s.plan) && !s.caseStudy && (
        <div className="container no-print mt-2">
          <div className="alert alert-info mb-0">⏳ The system chart analysis is complete. Pages 20–22 will be filled in with the astrologer's palmistry, face reading and case study after review.</div>
        </div>
      )}
      <div className="container">
        <Report s={s} chart={chart} a={analysis} />
      </div>
    </>
  );
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <WithStudent id={id}>
      {(s) => (
        <>
          <StudentHeader s={s} />
          <ReportView s={s} />
        </>
      )}
    </WithStudent>
  );
}
