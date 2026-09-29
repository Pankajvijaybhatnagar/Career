"use client";
import Link from "next/link";
import Report from "@/components/Report";
import { useChart } from "@/lib/useChart";
import { useDB, type Student } from "@/lib/store";
import { REPORT_PAGE_TITLES } from "@/lib/report-pages";

// A fully unlocked sample child, including a completed astrologer case study.
const SAMPLE: Student = {
  id: "sample",
  parentId: "sample",
  fullName: "Aarav Sharma",
  gender: "MALE",
  dateOfBirth: "2011-03-14",
  timeOfBirth: "07:45",
  birthTimeAccuracy: "EXACT",
  birthPlace: "New Delhi, Delhi",
  latitude: 28.6139,
  longitude: 77.209,
  tzOffset: 5.5,
  currentClass: "Class 9",
  schoolName: "Delhi Public School",
  favouriteSubjects: "Maths, Science, Computers",
  hobbies: "Coding games, chess, cricket",
  achievements: "School science exhibition – 1st prize; chess club member",
  parentGoals: "We are confused between Science (PCM) and Commerce after Class 10. He likes computers but gets distracted easily.",
  healthNotes: "",
  photos: {},
  plan: "PREMIUM",
  status: "REPORT_READY",
  payments: [],
  questions: [],
  sessions: [],
  createdAt: "2026-09-01T00:00:00.000Z",
  caseStudy: {
    palmistryNotes:
      "Right hand: a long, clear head line that slopes slightly towards the Moon mount shows a sharp analytical mind with good imagination, well suited to technology and problem solving.\nA well-developed Mercury mount and a long little finger indicate good communication and aptitude for logic, mathematics and business sense.\nThe fate line starts from the middle of the palm, so career direction becomes clear after the age of 17–18 and grows stronger with his own effort.\nLeft hand: the Sun line is faint but present, indicating recognition that comes through skill rather than luck.",
    faceReadingNotes:
      "A broad, high forehead shows intelligence and planning ability. Bright, focused eyes indicate curiosity and quick grasping power. Well-shaped eyebrows show determination. The firm chin indicates the ability to finish what he starts once he is interested.",
    astrologerSummary:
      "Aarav has a Pisces Lagna with Jupiter, the Lagna lord, strong in the first house: a wise, curious and well-meaning child. Mercury joins Jupiter, and Rahu influences the career house, pointing clearly to technology, computers and research-based work.\nCombined with the palm (strong head line, developed Mercury mount) and the face reading, the overall picture favours Science (PCM) with a focus on Computer Science / AI. Commerce is a possible second option, but his natural gifts are best used in technology.",
    recommendedStream: "Science (PCM)",
    remedies:
      "Recite 'Om Budhaya Namah' 11 times every Wednesday morning before studying.\nKeep the study table clean, facing east, with a small green plant.\nLimit mobile games to weekends; replace them with coding projects (Rahu's energy used positively).",
    parentGuidance:
      "Choose Science (PCM) after Class 10 and add Computer Science as an elective.\nEnrol him in a coding or robotics course during the summer holidays.\nUse short 40-minute study sessions with breaks, since his mind is quick but restless.\nPlan for JEE / CUET preparation from Class 11, and review progress with us in the Jupiter–Saturn period.",
    reviewedBy: "Chief Astrologer",
    reviewedAt: "2026-09-10T00:00:00.000Z",
  },
};

export default function SampleReportPage() {
  const { chart, analysis } = useChart(SAMPLE);
  const { ready } = useDB(); // render after mount (report uses the current date)
  if (!ready) return null;
  return (
    <>
      <div className="report-toolbar">
        <div className="container flex between flex-wrap">
          <div className="flex flex-wrap">
            <span className="badge badge-premium">Sample report</span>
            <b>All 22 pages unlocked</b>
            <select className="select" style={{ width: "auto", padding: "6px 10px" }} defaultValue="" onChange={(e) => document.getElementById(`page-${e.target.value}`)?.scrollIntoView({ behavior: "smooth" })}>
              <option value="" disabled>Jump to page…</option>
              {REPORT_PAGE_TITLES.map((t, i) => <option key={t.title} value={i + 1}>{i + 1}. {t.title}</option>)}
            </select>
          </div>
          <div className="flex">
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>🖨️ Print / PDF</button>
            <Link href="/register" className="btn btn-primary btn-sm">Get your child's report</Link>
          </div>
        </div>
      </div>
      <div className="container">
        <Report s={SAMPLE} chart={chart} a={analysis} />
      </div>
    </>
  );
}
