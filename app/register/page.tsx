import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="container">
      <div className="card form-card">
        <div className="center mb-2">
          <div className="icon-bubble" style={{ margin: "0 auto 12px" }}>👨‍👩‍👧</div>
          <h2 className="mb-0">Create a parent account</h2>
          <p className="muted">Free preview. No payment needed to start.</p>
        </div>
        <Suspense>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </div>
  );
}
