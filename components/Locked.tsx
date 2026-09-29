import UnlockButton from "./UnlockButton";

export default function Locked({ studentId, children, label = "Unlock with the Career Report (₹1500)" }: { studentId: string; children: React.ReactNode; label?: string }) {
  return (
    <div className="locked">
      <div className="blur" aria-hidden>{children}</div>
      <div className="lock-overlay">
        <div className="lock-icon">🔒</div>
        <b>This part is in the full report</b>
        <UnlockButton studentId={studentId} className="btn btn-primary btn-sm" goToReport={false}>{label}</UnlockButton>
      </div>
    </div>
  );
}
