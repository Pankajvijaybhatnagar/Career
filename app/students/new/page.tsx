"use client";
import { RequireAuth } from "@/components/Guard";
import StudentForm from "@/components/StudentForm";

export default function NewStudentPage() {
  return (
    <RequireAuth>
      {(user) => (
        <>
          <section className="page-head">
            <div className="container container-narrow">
              <h1>Register your child ✨</h1>
              <p>This takes about 5 minutes. Keep the birth certificate and a phone camera ready. Everything is saved as you go.</p>
            </div>
          </section>
          <div className="container container-narrow page-body">
            <StudentForm user={user} />
          </div>
        </>
      )}
    </RequireAuth>
  );
}
