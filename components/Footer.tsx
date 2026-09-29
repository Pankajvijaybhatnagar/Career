import Link from "next/link";

const SITE = process.env.NEXT_PUBLIC_SITE_NAME || "Vidya Jyotish";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container grid grid-4">
        <div>
          <h4>✦ {SITE}</h4>
          <p className="small">
            Career guidance for students, drawing on the wisdom of Vedic astrology, Prashna Kundali, palmistry and face reading, and designed to help parents make confident decisions.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link href="/#how">How it works</Link></li>
            <li><Link href="/#report">Report contents</Link></li>
            <li><Link href="/#pricing">Pricing</Link></li>
            <li><Link href="/#faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4>For Parents</h4>
          <ul>
            <li><Link href="/register">Create account</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/dashboard">My children</Link></li>
          </ul>
        </div>
        <div>
          <h4>Please note</h4>
          <p className="small">
            Astrological guidance should be used together with the child's interests, school performance and professional aptitude advice. Final decisions rest with parents.
          </p>
        </div>
      </div>
      <div className="container copy">© {new Date().getFullYear()} {SITE}. All rights reserved.</div>
    </footer>
  );
}
