import Link from "next/link";
import Stars from "@/components/Stars";
import PricingCards from "@/components/PricingCards";
import { CAREER_FIELDS } from "@/lib/astro/knowledge";
import { REPORT_PAGE_TITLES } from "@/lib/report-pages";

const STEPS = [
  { icon: "📝", title: "Register your child", text: "Enter the date, time and place of birth, then upload a face photo and photos of both hands (front and back)." },
  { icon: "🔭", title: "Kundali & Prashna analysis", text: "We prepare the birth chart and Prashna Kundali, then study the 10th house, planets, dashas and yogas for career." },
  { icon: "✋", title: "Palm & face case study", text: "Our astrologer studies the palm lines, mounts and facial features, and writes a personal case study." },
  { icon: "🎥", title: "Google Meet + 22-page report", text: "Pay the full fee and pick a 30-minute Google Meet with our astrologer 2–3 days later, then receive the complete report." },
];

const WHY = [
  { icon: "👨‍👩‍👧", title: "Made for parents", text: "Simple language, clear recommendations and a practical action plan. No confusing jargon." },
  { icon: "🎯", title: "Stream after Class 10", text: "A clear recommendation for Science (PCM/PCB), Commerce or Humanities, with the reasons." },
  { icon: "🌍", title: "Like global aptitude tests", text: "Abroad, psychometric tests guide students. We add the depth of Jyotish to understand each child's nature." },
  { icon: "🔒", title: "Private & secure", text: "Photos and birth details are stored privately and shown only to you and your astrologer." },
];

const FAQ = [
  { q: "What do I need to register?", a: "The child's full name, date of birth, exact time of birth (from the birth certificate if possible), place of birth, one clear face photo and 4 hand photos (left and right, palm and back)." },
  { q: "What is included in the free preview?", a: "You get the child's profile, birth chart (Kundali), planet positions, the first 4 pages of the report and 1 Prashna question with a system reading. The complete 22-page report, the palm and face reading and counselling are part of the paid plans." },
  { q: "What is Prashna Kundali?", a: "Prashna (horary) astrology casts a chart for the exact moment a sincere question is asked. It is very useful when the birth time is not known, and for specific questions like 'Will my child clear this exam?'." },
  { q: "How long does the full report take?", a: "The system chart is ready instantly. The astrologer's palmistry, face reading and case study are usually completed within 3–5 working days (48 hours for Premium)." },
  { q: "Can I register more than one child?", a: "Yes. Each child has their own profile, report and questions. Payment is per child." },
  { q: "Is the payment secure?", a: "Payments are processed by Razorpay using UPI, cards, net banking or wallets. We never see or store your card details." },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <Stars />
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">✨ Jyotish based career counselling</span>
            <h1>
              Find the career your child is <span className="highlight">born to shine</span> in
            </h1>
            <p className="lead">
              A personalised 22-page career report, based on your child's Kundali, Prashna Kundali, palm lines and facial features, so parents can choose the right stream and career with confidence.
            </p>
            <div className="hero-badges">
              <span className="hero-badge">🪐 Vedic birth chart</span>
              <span className="hero-badge">❓ Prashna Kundali</span>
              <span className="hero-badge">✋ Palmistry</span>
              <span className="hero-badge">🙂 Face reading</span>
            </div>
            <div className="flex flex-wrap">
              <Link href="/register" className="btn btn-primary btn-lg">Start free preview →</Link>
              <Link href="/sample-report" className="btn btn-ghost-light btn-lg">📘 View sample report</Link>
            </div>
          </div>
          <div className="hero-card floaty">
            <div className="flex between mb-2">
              <strong>Sample: Aarav, Class 9</strong>
              <span className="badge badge-paid">Report ready</span>
            </div>
            {[
              ["💻 Computer Science & AI", 92],
              ["⚙️ Engineering & Technology", 86],
              ["🔬 Research & Sciences", 78],
              ["📊 Commerce & Finance", 64],
            ].map(([label, v]) => (
              <div key={label as string} style={{ marginBottom: 14 }}>
                <div className="flex between small"><span>{label}</span><b>{v}%</b></div>
                <div className="progress"><span style={{ width: `${v}%` }} /></div>
              </div>
            ))}
            <div className="callout violet" style={{ color: "var(--ink)", marginBottom: 0 }}>
              <b>Recommended stream:</b> Science (PCM)<br />
              <span className="small">Strong Mercury and Rahu, with Saturn aspecting the 10th house</span>
            </div>
          </div>
        </div>
        <svg className="hero-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" height="60" width="100%">
          <path d="M0,40 C360,90 1080,-10 1440,40 L1440,80 L0,80 Z" fill="var(--bg)" />
        </svg>
      </section>

      <section className="section-sm">
        <div className="container grid grid-4">
          {[["22", "page personalised report"], ["16", "career fields analysed"], ["5", "photos for palm & face study"], ["1:1", "counselling for parents"]].map(([b, t]) => (
            <div className="stat" key={t}><b>{b}</b><span className="muted">{t}</span></div>
          ))}
        </div>
      </section>

      <section className="section" id="how">
        <div className="container">
          <div className="section-title">
            <span className="eyebrow">How it works</span>
            <h2>Four simple steps for parents</h2>
            <p>Parents lead the decision. We give you a clear map of your child's natural talents.</p>
          </div>
          <div className="grid grid-4">
            {STEPS.map((s, i) => (
              <div className="card card-hover step-card" key={s.title}>
                <span className="step-num">{i + 1}</span>
                <div className="icon-bubble">{s.icon}</div>
                <h3>{s.title}</h3>
                <p className="muted small mb-0">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="report" style={{ background: "var(--grad-soft)" }}>
        <div className="container">
          <div className="section-title">
            <span className="eyebrow">What you receive</span>
            <h2>A proper 22-page career report</h2>
            <p>Every page is written for parents: what it means, why it matters and what to do next.</p>
            <Link href="/sample-report" className="btn btn-secondary">Open the full sample report →</Link>
          </div>
          <div className="grid grid-4">
            {REPORT_PAGE_TITLES.map((t, i) => (
              <div key={t.title} className="card card-hover flex" style={{ alignItems: "flex-start" }}>
                <div className={`icon-bubble ${["violet", "teal", "pink", "sky"][i % 4]}`} style={{ width: 44, height: 44, fontSize: "1.2rem" }}>{t.icon}</div>
                <div>
                  <div className="small muted">Page {i + 1}</div>
                  <b>{t.title}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <span className="eyebrow">Career fields</span>
            <h2>16 career families, matched to the stars</h2>
            <p>Each field is scored from planetary strengths, the 10th house, and supportive houses and aspects.</p>
          </div>
          <div className="grid grid-4">
            {CAREER_FIELDS.map((f) => (
              <div key={f.id} className="card card-hover">
                <div style={{ fontSize: "2rem" }}>{f.icon}</div>
                <h3 style={{ fontSize: "1.05rem" }}>{f.name}</h3>
                <p className="small muted mb-0">{f.careers.slice(0, 3).join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--surface-2)" }}>
        <div className="container">
          <div className="section-title">
            <span className="eyebrow">Why parents trust us</span>
            <h2>Guidance that makes sense</h2>
          </div>
          <div className="grid grid-4">
            {WHY.map((w) => (
              <div className="card" key={w.title}>
                <div className="icon-bubble violet mb-2">{w.icon}</div>
                <h3>{w.title}</h3>
                <p className="small muted mb-0">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <div className="section-title">
            <span className="eyebrow">Simple pricing</span>
            <h2>Start free. Unlock the full report for ₹1500.</h2>
            <p>The free preview lets you see how it works. The full guidance is one payment per child, with no subscriptions.</p>
          </div>
          <PricingCards />
        </div>
      </section>

      <section className="section" id="faq" style={{ background: "var(--grad-soft)" }}>
        <div className="container container-narrow faq">
          <div className="section-title">
            <span className="eyebrow">FAQ</span>
            <h2>Questions parents ask</h2>
          </div>
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>Give your child the right direction today</h2>
            <p>Create a free account in 1 minute and see your child's Kundali instantly.</p>
            <Link href="/register" className="btn btn-lg" style={{ background: "#fff", color: "var(--saffron-deep)" }}>
              Register my child →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
