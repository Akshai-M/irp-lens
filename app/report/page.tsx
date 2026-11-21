import { AppHeader } from "@/components/app-header";
import { TrackCards } from "@/components/track-cards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { loadStudentRecord, totalAttempts } from "@/lib/attempts";
import { requireRole, STUDENT_LOGIN } from "@/lib/session";

// Reads the session cookie, so it must render per request.
export const instant = false;

export default async function StudentReportPage() {
  const session = await requireRole(["student"], STUDENT_LOGIN);
  const load = await loadStudentRecord(session.email ?? "");

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader title="Interview Feedback" />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Your interviews</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Choose a report</h2>
          <p className="max-w-2xl text-base text-foreground/70">
            Each card shows your latest result and the score for every domain. Open a report to see its Latest and Best
            results, or your full History.
          </p>
        </div>

        {load.ok ? (
          <>
            {load.unavailable.length > 0 ? (
              <Alert>
                <AlertDescription>
                  Some feedback could not be loaded right now. Refresh the page in a moment to see all of it.
                </AlertDescription>
              </Alert>
            ) : null}
            {totalAttempts(load.record) === 0 ? (
              <Alert>
                <AlertTitle>Your feedback is not available yet</AlertTitle>
                <AlertDescription>No interview feedback is linked to this email yet. Please check back later.</AlertDescription>
              </Alert>
            ) : null}
            <TrackCards record={load.record} hrefFor={(track) => `/report/${track}`} />
          </>
        ) : (
          <Alert variant={load.reason === "not_found" ? "default" : "destructive"}>
            <AlertTitle>
              {load.reason === "not_found" ? "Your feedback is not available yet" : "We could not load your feedback"}
            </AlertTitle>
            <AlertDescription>
              {load.reason === "not_found"
                ? "No interview feedback is linked to this email yet. Please check back later."
                : "The feedback service is unavailable right now. Please refresh the page in a moment."}
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
