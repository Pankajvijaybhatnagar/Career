"use client";
import { useState } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MIN_BIRTH_YEAR = 1950;

/** Day / Month / Year dropdowns. Calls onChange with "YYYY-MM-DD" once all three are chosen, else "". */
export default function DateOfBirthSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [init] = useState(() => (value ? value.split("-") : ["", "", ""]));
  const [y, setY] = useState(init[0]);
  const [m, setM] = useState(init[1]);
  const [d, setD] = useState(init[2]);

  const now = new Date();
  const years = Array.from({ length: now.getFullYear() - MIN_BIRTH_YEAR + 1 }, (_, i) => String(now.getFullYear() - i));
  const daysInMonth = y && m ? new Date(Number(y), Number(m), 0).getDate() : 31;

  function update(ny: string, nm: string, nd: string) {
    // Keep the day valid when the month or year changes (e.g. 31 → 30 for April, 29 Feb in non-leap years).
    if (ny && nm && nd) {
      const max = new Date(Number(ny), Number(nm), 0).getDate();
      if (Number(nd) > max) nd = String(max).padStart(2, "0");
    }
    setY(ny); setM(nm); setD(nd);
    onChange(ny && nm && nd ? `${ny}-${nm}-${nd}` : "");
  }

  return (
    <div className="dob-select">
      <select className="select" aria-label="Day" value={d} onChange={(e) => update(y, m, e.target.value)}>
        <option value="">Day</option>
        {Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0")).map((x) => <option key={x} value={x}>{Number(x)}</option>)}
      </select>
      <select className="select" aria-label="Month" value={m} onChange={(e) => update(y, e.target.value, d)}>
        <option value="">Month</option>
        {MONTHS.map((name, i) => <option key={name} value={String(i + 1).padStart(2, "0")}>{name}</option>)}
      </select>
      <select className="select" aria-label="Year" value={y} onChange={(e) => update(e.target.value, m, d)}>
        <option value="">Year</option>
        {years.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
    </div>
  );
}
