"use client";
import { useParams } from "next/navigation";
import { WithStudent } from "@/components/Guard";
import StudentForm from "@/components/StudentForm";

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <WithStudent id={id}>
      {(s, user) => (
        <>
          <section className="page-head">
            <div className="container container-narrow">
              <h1>Edit {s.fullName}'s details ✏️</h1>
              <p>Correct any detail or replace a photo. The Kundali and report update automatically.</p>
            </div>
          </section>
          <div className="container container-narrow page-body">
            <StudentForm user={user} student={s} />
          </div>
        </>
      )}
    </WithStudent>
  );
}
