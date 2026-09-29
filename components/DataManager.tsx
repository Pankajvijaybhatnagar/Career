"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cleanUnusedPhotos, exportBackup, importBackup, resetAllData, storageUsage, useDB } from "@/lib/store";

type Usage = Awaited<ReturnType<typeof storageUsage>>;

const mb = (b?: number) => (b === undefined ? "—" : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

/** Test-data management for the frontend-only demo (all data lives in this browser). */
export default function DataManager() {
  const { db } = useDB();
  const router = useRouter();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");

  const refresh = () => storageUsage().then(setUsage).catch(() => {});
  useEffect(() => { refresh(); }, [db]);

  async function run(label: string, fn: () => Promise<string>) {
    setBusy(label); setMsg(""); setErr("");
    try { setMsg(await fn()); } catch (e) { setErr((e as Error).message); }
    setBusy(""); refresh();
  }

  const localLimit = 5 * 1024 * 1024;
  const localPct = usage ? Math.min(100, (usage.localBytes / localLimit) * 100) : 0;

  return (
    <div className="card mt-3">
      <h3>🗄️ Data & storage</h3>
      <p className="small muted">
        This demo keeps all data in this browser only. Details are kept in local storage and photos in the browser's photo storage. Use a backup to move data to another browser or computer.
      </p>
      {msg && <div className="alert alert-success small">{msg}</div>}
      {err && <div className="alert alert-error small">{err}</div>}

      <div className="grid grid-3" style={{ gap: 12 }}>
        <div className="card card-soft"><div className="small muted">Accounts</div><b style={{ fontSize: "1.4rem" }}>{db.users.length}</b></div>
        <div className="card card-soft"><div className="small muted">Children</div><b style={{ fontSize: "1.4rem" }}>{db.students.length}</b></div>
        <div className="card card-soft"><div className="small muted">Photos stored</div><b style={{ fontSize: "1.4rem" }}>{usage?.photos ?? "—"}</b></div>
      </div>

      <div className="mt-2 small">Details storage: {mb(usage?.localBytes)} of about 5 MB</div>
      <div className={`progress ${localPct > 80 ? "" : "cool"}`}><span style={{ width: `${localPct}%` }} /></div>
      <div className="small muted mt-1">
        Total browser storage used: {mb(usage?.usage)}{usage?.quota ? ` of ${mb(usage.quota)} available` : ""}
      </div>

      <div className="flex flex-wrap mt-2">
        <button className="btn btn-secondary btn-sm" disabled={!!busy} onClick={() => run("export", async () => {
          const json = await exportBackup();
          const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
          const a = document.createElement("a");
          a.href = url; a.download = `vidya-jyotish-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          return `Backup downloaded (${db.students.length} children, with photos).`;
        })}>{busy === "export" ? "Preparing…" : "⬇️ Download backup"}</button>

        <label className="btn btn-outline btn-sm" style={{ cursor: busy ? "not-allowed" : "pointer" }}>
          {busy === "import" ? "Restoring…" : "⬆️ Restore from backup"}
          <input type="file" accept="application/json,.json" hidden disabled={!!busy} onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (!window.confirm("Restoring replaces ALL current data in this browser with the backup. Continue?")) return;
            run("import", async () => {
              const r = await importBackup(await file.text());
              return `Restored ${r.users} accounts and ${r.students} children.`;
            });
          }} />
        </label>

        <button className="btn btn-outline btn-sm" disabled={!!busy} onClick={() => run("clean", async () => {
          const n = await cleanUnusedPhotos();
          return n ? `Removed ${n} unused photo(s).` : "No unused photos found.";
        })}>🧹 Remove unused photos{usage?.unusedPhotos ? ` (${usage.unusedPhotos})` : ""}</button>

        <button className="btn btn-outline btn-sm" style={{ color: "var(--red)" }} disabled={!!busy} onClick={() => {
          if (!window.confirm("Delete ALL accounts, children, photos and bookings from this browser? This cannot be undone. Download a backup first if you need the data.")) return;
          run("reset", async () => { await resetAllData(); router.push("/"); return "All data deleted."; });
        }}>🗑️ Reset all data</button>
      </div>
    </div>
  );
}
