"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useDB, type Student, type User } from "@/lib/store";

export function Loading() {
  return (
    <div className="container section center muted">
      <div style={{ fontSize: "2.4rem" }} className="floaty">🪐</div>
      Reading the stars…
    </div>
  );
}

/** Renders children only for a logged-in user (optionally an admin). */
export function RequireAuth({ admin, children }: { admin?: boolean; children: (user: User) => React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(path)}`);
    else if (admin && user.role !== "ADMIN") router.replace("/dashboard");
  }, [ready, user, admin, router, path]);
  if (!ready || !user || (admin && user.role !== "ADMIN")) return <Loading />;
  return <>{children(user)}</>;
}

/** Loads a student the current user may see (the parent who owns it, or the astrologer). */
export function WithStudent({ id, children }: { id: string; children: (s: Student, user: User) => React.ReactNode }) {
  const { db } = useDB();
  return (
    <RequireAuth>
      {(user) => {
        const s = db.students.find((x) => x.id === id);
        if (!s || (user.role !== "ADMIN" && s.parentId !== user.id)) {
          return (
            <div className="container section center">
              <div style={{ fontSize: "3rem" }}>🔍</div>
              <h2>Profile not found</h2>
              <Link href="/dashboard" className="btn btn-primary">Back to my children</Link>
            </div>
          );
        }
        return children(s, user);
      }}
    </RequireAuth>
  );
}
