import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="container">
      <div className="card form-card">
        <div className="center mb-2">
          <div className="icon-bubble violet" style={{ margin: "0 auto 12px" }}>🔑</div>
          <h2 className="mb-0">Welcome back</h2>
          <p className="muted">Log in to see your child's profile and report</p>
        </div>
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </div>
  );
}
