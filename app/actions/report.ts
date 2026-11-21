"use server";

import { loadStudentRecord, type StudentRecord } from "@/lib/attempts";
import { requireRole, STUDENT_LOGIN } from "@/lib/session";

export type RefetchResult =
  | { record: StudentRecord; error?: undefined }
  | { record?: undefined; error: string };

/** Re-reads every track for the signed-in student. The email always comes from the session. */
export async function refetchStudentRecord(): Promise<RefetchResult> {
  const session = await requireRole(["student"], STUDENT_LOGIN);
  const load = await loadStudentRecord(session.email ?? "");

  if (load.ok) return { record: load.record };
  if (load.reason === "not_found") {
    return { error: "Your feedback is no longer available for this email." };
  }
  return { error: "The feedback service is unavailable right now. Please try again shortly." };
}
