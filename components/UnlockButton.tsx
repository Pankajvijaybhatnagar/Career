"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { payForPlan } from "@/lib/store";
import { TEST_MODE } from "@/lib/plans";

/** In TEST_MODE unlocks the full report immediately; otherwise opens the checkout page. */
export default function UnlockButton({
  studentId, children, className = "btn btn-primary", goToReport = true,
}: { studentId: string; children: React.ReactNode; className?: string; goToReport?: boolean }) {
  const router = useRouter();
  if (!TEST_MODE) return <Link href={`/students/${studentId}/checkout`} className={className}>{children}</Link>;
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        payForPlan(studentId, "STANDARD", "TEST");
        if (goToReport) router.push(`/students/${studentId}/report`);
      }}
    >
      {children}
    </button>
  );
}
