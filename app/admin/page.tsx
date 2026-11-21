import type { ReactNode } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { SearchForm } from "@/components/search-form";
import { TrackCards } from "@/components/track-cards";
import { TrackReport } from "@/components/track-report";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStudentRecord, totalAttempts } from "@/lib/attempts";
import { EMAIL_PATTERN } from "@/lib/feedback";
import { trackById } from "@/lib/config";
import { ADMIN_LOGIN, requireRole } from "@/lib/session";

// Reads the session cookie, so it must render per request.
export const instant = false;

type SearchParams = Promise<{ email?: string; track?: string }>;

function lookupHref(email: string, track?: string): string {
  const params = new URLSearchParams({ email });
  if (track) params.set("track", track);
  return `/admin?${params.toString()}`;
}

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireRole(["admin", "admin_view"], ADMIN_LOGIN);
  const { email: rawEmail, track: rawTrack } = await searchParams;
  const email = (rawEmail ?? "").trim().toLowerCase();
  const track = trackById(rawTrack ?? "");

  let body: ReactNode = null;
  if (email) {
    if (!EMAIL_PATTERN.test(email)) {
      body = (
        <Alert variant="destructive">
          <AlertDescription>Enter a valid email address.</AlertDescription>
        </Alert>
      );
    } else {
      const load = await loadStudentRecord(email);
      if (!load.ok) {
        body = (
          <Alert variant={load.reason === "not_found" ? "default" : "destructive"}>
            <AlertDescription>
              {load.reason === "not_found"
                ? "No interview feedback was found for this email."
                : "The feedback service is unavailable right now. Please try again shortly."}
            </AlertDescription>
          </Alert>
        );
      } else if (track) {
        const attempts = load.record[track.id];
        body = (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{track.label}</p>
                <h2 className="font-heading text-2xl font-semibold tracking-tight">{email}</h2>
              </div>
              <Link href={lookupHref(email)} className="text-sm font-medium underline-offset-4 hover:underline">
                ← All interviews
              </Link>
            </div>
            {attempts.length === 0 ? (
              <Alert>
                <AlertDescription>This student has no {track.label} interview yet.</AlertDescription>
              </Alert>
            ) : (
              <TrackReport key={`${email}-${track.id}`} trackId={track.id} initialAttempts={attempts} />
            )}
          </div>
        );
      } else {
        body = (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{email}</p>
              <h2 className="font-heading text-3xl font-semibold tracking-tight">Choose a report</h2>
              <p className="max-w-2xl text-base text-foreground/70">
                Each card shows the latest result and the score for every domain. Open a report to see its Latest and
                Best results, or the full History.
              </p>
            </div>
            {load.unavailable.length > 0 ? (
              <Alert>
                <AlertDescription>Some feedback could not be loaded right now. Search again in a moment.</AlertDescription>
              </Alert>
            ) : null}
            {totalAttempts(load.record) === 0 ? (
              <Alert>
                <AlertDescription>No interview feedback was found for this email.</AlertDescription>
              </Alert>
            ) : null}
            <TrackCards record={load.record} hrefFor={(id) => lookupHref(email, id)} />
          </div>
        );
      }
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader title="IRP Assessment Report" />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6 sm:py-10 print:py-0">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl font-semibold">Student reports</CardTitle>
            <CardDescription className="text-base text-foreground/70">
              Search by a student&apos;s interview email to view their feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SearchForm defaultValue={email} />
          </CardContent>
        </Card>

        {body}

        {session.role === "admin" ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold">User metrics</CardTitle>
              <CardDescription className="text-base text-foreground/70">
                Student activity on the report site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTitle>On hold</AlertTitle>
                <AlertDescription>
                  Metrics need a place to store student activity. They will be added once that is connected.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
