"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, useAuth } from "@/lib/store";
import NavMenu from "./NavMenu";

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Vidya Jyotish";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">✦</span>
          {SITE_NAME}
        </Link>
        <NavMenu>
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link href="/admin">Astrologer Panel</Link>
              ) : (
                <>
                  <Link href="/dashboard">My Children</Link>
                  <Link href="/students/new">Add Child</Link>
                  <Link href="/sample-report">Sample Report</Link>
                </>
              )}
              <Link href="/profile" className="nav-user">
                <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
                <span>{user.name.split(" ")[0]}</span>
              </Link>
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); router.push("/"); }}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/#how">How it works</Link>
              <Link href="/sample-report">Sample Report</Link>
              <Link href="/#pricing">Pricing</Link>
              <Link href="/#faq">FAQ</Link>
              <Link href="/login">Login</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Start for Free</Link>
            </>
          )}
        </NavMenu>
      </div>
    </header>
  );
}
