import Link from "next/link";
import { PLANS, formatINR } from "@/lib/plans";

export default function PricingCards({ ctaHref = "/register" }: { ctaHref?: string }) {
  const plans = [PLANS.FREE, PLANS.STANDARD, PLANS.PREMIUM];
  return (
    <div className="grid grid-3" style={{ alignItems: "stretch" }}>
      {plans.map((p) => (
        <div key={p.id} className={`card price-card ${p.id === "STANDARD" ? "featured" : ""}`}>
          {p.id === "STANDARD" && <span className="ribbon">Most chosen by parents</span>}
          <h3 className="mb-0">{p.name}</h3>
          <p className="muted small mb-0">{p.tagline}</p>
          <div className="price">
            {p.price === 0 ? "Free" : formatINR(p.price)} {p.price > 0 && <small>/ child</small>}
          </div>
          <ul className="check-list">
            {p.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <Link href={ctaHref} className={`btn btn-block ${p.id === "STANDARD" ? "btn-primary" : "btn-outline"}`}>
            {p.price === 0 ? "Start free preview" : `Get ${p.name}`}
          </Link>
        </div>
      ))}
    </div>
  );
}
