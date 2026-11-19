"use server";

import { lookupStudentRow } from "@/lib/feedback";
import { buildReportView, type ReportView } from "@/lib/report";
import { requireRole, STUDENT_LOGIN } from "@/lib/session";

export type RefetchResult =
  | { report: ReportView; error?: undefined }
  | { report?: undefined; error: string };

/** Re-reads the signed-in student's row from the sheet. The email always comes from the session. */
export async function refetchStudentReport(): Promise<RefetchResult> {
  const session = await requireRole(["student"], STUDENT_LOGIN);
  const lookup = await lookupStudentRow(session.email ?? "");

  if (lookup.ok) return { report: buildReportView(lookup.row) };
  if (lookup.reason === "not_found") {
    return { error: "Your feedback is no longer available for this email." };
  }
  return { error: "The feedback service is unavailable right now. Please try again shortly." };
}
