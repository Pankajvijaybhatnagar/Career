"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <>
      <button className="nav-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "✕" : "☰"}
      </button>
      <nav className={`nav-links ${open ? "open" : ""}`}>{children}</nav>
    </>
  );
}
