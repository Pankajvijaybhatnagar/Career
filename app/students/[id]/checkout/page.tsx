"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { WithStudent } from "@/components/Guard";
import StudentHeader from "@/components/StudentHeader";
import { payForPlan, type Student } from "@/lib/store";
import { PLANS, TEST_MODE, formatINR, planOf, type PlanId } from "@/lib/plans";

const METHODS = [
  { id: "UPI", label: "UPI", icon: "📱", hint: "GPay, PhonePe, Paytm" },
  { id: "CARD", label: "Card", icon: "💳", hint: "Debit / Credit" },
  { id: "NETBANKING", label: "Net Banking", icon: "🏦", hint: "All major banks" },
];

function Checkout({ s }: { s: Student }) {
  const router = useRouter();
  const current = planOf(s.plan);
  const [selected, setSelected] = useState<PlanId>(s.plan === "STANDARD" ? "PREMIUM" : "STANDARD");
  const [method, setMethod] = useState("UPI");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  const target = PLANS[selected];
  const due = Math.max(target.price - current.price, 0);
  const options = (["STANDARD", "PREMIUM"] as PlanId[]).filter((p) => PLANS[p].price > current.price);

  function pay() {
    setPaying(true);
    // Demo only: simulate the payment gateway. Replace with Razorpay Checkout when the backend is ready.
    setTimeout(() => {
      payForPlan(s.id, selected, method);
      setPaying(false);
      setDone(true);
    }, TEST_MODE ? 0 : 1400);
  }

  if (done) {
    return (
      <div className="container container-narrow section-sm">
        <div className="card empty">
          <div className="big">🎉</div>
          <h2>Payment successful</h2>
          <p className="muted">
            {s.fullName}'s <b>{target.name}</b> is now active. All 22 pages of the report are unlocked, and our astrologer will begin the palmistry and face-reading case study.
          </p>
          <div className="flex flex-wrap" style={{ justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => router.push(`/students/${s.id}/meeting`)}>🎥 Book Google Meet</button>
            <button className="btn btn-secondary" onClick={() => router.push(`/students/${s.id}/report`)}>Open the full report</button>
            <button className="btn btn-outline" onClick={() => router.push(`/students/${s.id}`)}>Back to profile</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-sm">
      {options.length === 0 ? (
        <div className="card empty">
          <div className="big">👑</div>
          <h2>You're on the highest plan</h2>
          <p className="muted">{s.fullName} has {current.name}. Enjoy all the features!</p>
        </div>
      ) : (
        <div className="grid grid-main">
          <div className="stack">
            <h2>Choose a plan for {s.fullName}</h2>
            {options.map((id) => {
              const p = PLANS[id];
              return (
                <label key={id} className="card card-hover" style={{ display: "block", cursor: "pointer", borderColor: selected === id ? "var(--saffron)" : undefined, borderWidth: 2 }}>
                  <div className="flex between">
                    <div className="flex">
                      <input type="radio" name="plan" checked={selected === id} onChange={() => setSelected(id)} />
                      <div>
                        <h3 className="mb-0">{p.name}</h3>
                        <div className="small muted">{p.tagline}</div>
                      </div>
                    </div>
                    <div className="price" style={{ fontSize: "1.8rem", margin: 0 }}>{formatINR(p.price)}</div>
                  </div>
                  <ul className="check-list" style={{ margin: "12px 0 0" }}>
                    {p.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </label>
              );
            })}
          </div>

          <div className="card" style={{ position: "sticky", top: 96 }}>
            <h3>Order summary</h3>
            <dl className="kv">
              <dt>Student</dt><dd>{s.fullName}</dd>
              <dt>Plan</dt><dd>{target.name}</dd>
              <dt>Price</dt><dd>{formatINR(target.price)}</dd>
              {current.price > 0 && (<><dt>Already paid</dt><dd>− {formatINR(current.price)}</dd></>)}
            </dl>
            <hr className="divider" />
            <div className="flex between"><b>Total payable</b><b className="price" style={{ fontSize: "1.8rem", margin: 0 }}>{formatINR(due)}</b></div>
            <div className="small muted mb-2">Inclusive of all taxes</div>

            <div className="field">
              <label>Payment method</label>
              <div className="grid grid-3" style={{ gap: 8 }}>
                {METHODS.map((m) => (
                  <button key={m.id} type="button" onClick={() => setMethod(m.id)} className="card center" style={{ padding: 10, cursor: "pointer", borderWidth: 2, borderColor: method === m.id ? "var(--violet)" : undefined, background: method === m.id ? "#f1ecff" : "#fff" }}>
                    <div style={{ fontSize: "1.4rem" }}>{m.icon}</div>
                    <b className="small">{m.label}</b>
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={paying} onClick={pay}>
              {paying ? <><span className="spinner" /> Processing…</> : `Pay ${formatINR(due)} securely`}
            </button>
            <p className="small muted center mt-1 mb-0">🔒 {TEST_MODE ? "Test mode: unlocks instantly, no payment." : "Demo mode: no real money is charged."}</p>
          </div>
        </div>
      )}

      {s.payments.length > 0 && (
        <div className="card mt-3">
          <h3>Payment history</h3>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Receipt</th><th>Date</th><th>Plan</th><th>Method</th><th>Amount</th></tr></thead>
              <tbody>
                {s.payments.map((p) => (
                  <tr key={p.id}><td>{p.id}</td><td>{p.paidAt.slice(0, 10)}</td><td>{PLANS[p.plan].name}</td><td>{p.method}</td><td>{formatINR(p.amount)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <WithStudent id={id}>
      {(s) => (
        <>
          <StudentHeader s={s} />
          <Checkout s={s} />
        </>
      )}
    </WithStudent>
  );
}
