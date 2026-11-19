import { AppHeader } from "@/components/app-header";
import { FeedbackReport } from "@/components/feedback-report";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { lookupStudentRow } from "@/lib/feedback";
import { buildReportView } from "@/lib/report";
import { requireRole, STUDENT_LOGIN } from "@/lib/session";

// Reads the session cookie, so it must render per request.
export const instant = false;

export default async function StudentReportPage() {
  const session = await requireRole(["student"], STUDENT_LOGIN);
  const lookup = await lookupStudentRow(session.email ?? "");

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader title="Interview Feedback" showPrint />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10 print:py-0">
        {lookup.ok ? (
          <FeedbackReport report={buildReportView(lookup.row)} />
        ) : (
          <Alert variant={lookup.reason === "not_found" ? "default" : "destructive"}>
            <AlertTitle>
              {lookup.reason === "not_found"
                ? "Your feedback is not available yet"
                : "We could not load your feedback"}
            </AlertTitle>
            <AlertDescription>
              {lookup.reason === "not_found"
                ? "No interview feedback is linked to this email yet. Please check back later."
                : "The feedback service is unavailable right now. Please refresh the page in a moment."}
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
