import Link from "next/link";
import { ArrowRight, CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRACKS, type TrackId } from "@/lib/config";
import type { Attempt, StudentRecord } from "@/lib/attempts";
import { cn } from "@/lib/utils";

function DomainScores({ attempt }: { attempt: Attempt }) {
  const domains = attempt.report.domains;
  if (domains.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Domain scores</p>
      <ul className="divide-y rounded-lg border">
        {domains.map((domain) => (
          <li key={domain.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="min-w-0 truncate">{domain.name}</span>
            <span className="flex shrink-0 items-center gap-2">
              {domain.statusLabel ? (
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {domain.statusLabel}
                </Badge>
              ) : null}
              <span className="font-mono font-semibold">{domain.rating || "—"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One card per interview track. Each shows the latest result, its domain scores, and a link to the full report. */
export function TrackCards({ record, hrefFor }: { record: StudentRecord; hrefFor: (track: TrackId) => string }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {TRACKS.map((track) => {
        const attempts = record[track.id];
        const latest = attempts[0];

        if (!latest) {
          return (
            <Card key={track.id} className="border-dashed bg-muted/30 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 font-heading text-xl font-semibold">
                  {track.label}
                  <Badge variant="outline" className="gap-1.5">
                    <CircleDashed aria-hidden className="size-3" />
                    No interview yet
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Your feedback will appear here once you take this interview.
              </CardContent>
            </Card>
          );
        }

        return (
          <Card key={track.id} className="min-w-0">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-3 font-heading text-xl font-semibold">
                {track.label}
                <Badge variant="secondary">
                  {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Latest score</p>
                  <p className="font-mono text-3xl font-semibold">{latest.scoreLabel}</p>
                  <p className="text-sm text-muted-foreground">Taken on {latest.dateLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Result</p>
                  <p className="font-medium">{latest.clearance || "—"}</p>
                </div>
              </div>

              <DomainScores attempt={latest} />

              <Link href={hrefFor(track.id)} className={cn(buttonVariants({ size: "lg" }), "w-full gap-2")}>
                View report
                <ArrowRight aria-hidden />
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
