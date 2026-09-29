"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DEMO_ADMIN, login, register } from "@/lib/store";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      if (mode === "register") {
        register({ name: d.name, email: d.email, phone: d.phone, password: d.password });
        router.push("/students/new");
      } else {
        const u = login(d.email, d.password);
        const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
        router.push(safe ?? (u.role === "ADMIN" ? "/admin" : "/dashboard"));
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      {mode === "register" && (
        <>
          <div className="field">
            <label htmlFor="name">Parent's full name</label>
            <input className="input" id="name" name="name" required placeholder="e.g. Sunita Sharma" />
          </div>
          <div className="field">
            <label htmlFor="phone">Mobile number</label>
            <input className="input" id="phone" name="phone" required placeholder="+91 98765 43210" inputMode="tel" />
          </div>
        </>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          className="input" id="password" name="password" type="password" required minLength={mode === "register" ? 8 : 1}
          placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
      </div>
      <button className="btn btn-primary btn-block btn-lg">{mode === "login" ? "Login" : "Create free account"}</button>
      <p className="center small mt-2 mb-0">
        {mode === "login" ? (
          <>New here? <Link href="/register">Create a free account</Link></>
        ) : (
          <>Already registered? <Link href="/login">Login</Link></>
        )}
      </p>
      {mode === "login" && (
        <div className="alert alert-info mt-2 mb-0 small">
          <b>Demo astrologer login:</b> {DEMO_ADMIN.email} / {DEMO_ADMIN.password}
        </div>
      )}
    </form>
  );
}
