import Link from "next/link";
import { notFound } from "next/navigation";
import { refetchStudentRecord } from "@/app/actions/report";
import { AppHeader } from "@/components/app-header";
import { TrackReport } from "@/components/track-report";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { loadStudentRecord } from "@/lib/attempts";
import { trackById } from "@/lib/config";
import { requireRole, STUDENT_LOGIN } from "@/lib/session";

// Reads the session cookie, so it must render per request.
export const instant = false;

export default async function StudentTrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track: trackParam } = await params;
  const track = trackById(trackParam);
  if (!track) notFound();

  const session = await requireRole(["student"], STUDENT_LOGIN);
  const load = await loadStudentRecord(session.email ?? "");
  const attempts = load.ok ? load.record[track.id] : [];

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader title="Interview Feedback" />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10 print:py-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{track.label}</p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Interview report</h2>
          </div>
          <Link href="/report" className="text-sm font-medium underline-offset-4 hover:underline">
            ← All interviews
          </Link>
        </div>

        {!load.ok ? (
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
        ) : attempts.length === 0 ? (
          <Alert>
            <AlertTitle>No {track.label} interview yet</AlertTitle>
            <AlertDescription>Your feedback will appear here once you take this interview.</AlertDescription>
          </Alert>
        ) : (
          <TrackReport trackId={track.id} initialAttempts={attempts} refetch={refetchStudentRecord} />
        )}
      </main>
    </div>
  );
}
