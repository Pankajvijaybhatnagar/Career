"use client";
import { useState } from "react";
import { RequireAuth } from "@/components/Guard";
import DataManager from "@/components/DataManager";
import { updateProfile, type User } from "@/lib/store";

function ProfileForm({ user }: { user: User }) {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      updateProfile(user.id, { name: d.name, phone: d.phone, password: d.password || undefined });
      setMsg("Profile updated");
      setErr("");
    } catch (e2) {
      setErr((e2 as Error).message);
      setMsg("");
    }
  }
  return (
    <div className="container">
      <div className="card form-card">
        <div className="center mb-2">
          <span className="avatar" style={{ width: 64, height: 64, fontSize: "1.6rem", margin: "0 auto 10px" }}>{user.name[0]}</span>
          <h2 className="mb-0">My profile</h2>
          <p className="muted">{user.email} · {user.role === "ADMIN" ? "Astrologer" : "Parent"}</p>
        </div>
        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={submit}>
          <div className="field"><label>Full name</label><input className="input" name="name" defaultValue={user.name} required /></div>
          <div className="field"><label>Mobile</label><input className="input" name="phone" defaultValue={user.phone} /></div>
          <div className="field"><label>New password</label><input className="input" type="password" name="password" placeholder="Leave empty to keep the current one" /></div>
          <button className="btn btn-primary btn-block">Save changes</button>
        </form>
      </div>
      <div style={{ maxWidth: 820, margin: "0 auto 48px" }}>
        <DataManager />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <RequireAuth>{(u) => <ProfileForm user={u} />}</RequireAuth>;
}
