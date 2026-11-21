"use client";

import { CalendarDays, CircleDotDashed, Eye, RefreshCw } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import type { RefetchResult } from "@/app/actions/report";
import { DownloadMarkdownButton } from "@/components/download-markdown-button";
import { FeedbackReport } from "@/components/feedback-report";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Attempt } from "@/lib/attempts";
import { pickBest, sortLatestFirst } from "@/lib/attempts";
import type { TrackId } from "@/lib/config";
import { cn } from "@/lib/utils";

type View = "latest" | "best" | "history";

function cacheKey(trackId: TrackId): string {
  return `irp-report-${trackId}`;
}

/** Keeps a copy of this track's attempts in the browser. Storage can be blocked, so every access is guarded. */
function saveToCache(trackId: TrackId, attempts: Attempt[]): string | null {
  const savedAt = new Date().toISOString();
  try {
    localStorage.setItem(cacheKey(trackId), JSON.stringify({ savedAt, attempts }));
    return savedAt;
  } catch {
    return null;
  }
}

function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function ClearanceBadge({ clearance }: { clearance: string }) {
  if (!clearance) return <span className="text-muted-foreground">—</span>;
  return <Badge variant={clearance.toLowerCase() === "cleared" ? "default" : "destructive"}>{clearance}</Badge>;
}

export function TrackReport({
  trackId,
  initialAttempts,
  refetch,
}: {
  trackId: TrackId;
  initialAttempts: Attempt[];
  /** Student view only. Admins search again to see the latest data. */
  refetch?: () => Promise<RefetchResult>;
}) {
  const [attempts, setAttempts] = useState(() => sortLatestFirst(initialAttempts));
  const [view, setView] = useState<View>("latest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // First load: keep a copy in local storage.
  useEffect(() => {
    saveToCache(trackId, initialAttempts);
  }, [trackId, initialAttempts]);

  const latest = attempts[0] ?? null;
  const best = pickBest(attempts);
  const selected = attempts.find((attempt) => attempt.id === selectedId) ?? null;
  const shown: Attempt | null = view === "latest" ? latest : view === "best" ? best : selected;

  function handleRefetch() {
    if (!refetch) return;
    setError(null);
    startTransition(async () => {
      const result = await refetch();
      if (result.record) {
        const fresh = sortLatestFirst(result.record[trackId]);
        setAttempts(fresh);
        setSavedAt(saveToCache(trackId, fresh));
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Tabs value={view} onValueChange={(next) => setView(next as View)}>
          <TabsList>
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="best">Best</TabsTrigger>
            <TabsTrigger value="history">History ({attempts.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full flex-wrap items-center gap-3 sm:ml-auto sm:w-auto sm:justify-end">
          {savedAt ? (
            <span className="w-full text-sm text-foreground/70 sm:w-auto">Last updated {formatSavedAt(savedAt)}</span>
          ) : null}
          {refetch ? (
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleRefetch} disabled={pending}>
              {pending ? (
                <CircleDotDashed aria-hidden className="animate-spin" />
              ) : (
                <RefreshCw aria-hidden />
              )}
              {pending ? "Refetching" : "Refetch"}
            </Button>
          ) : null}
          {shown ? <DownloadMarkdownButton report={shown.report} /> : null}
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {view === "latest" && latest ? <FeedbackReport report={latest.report} /> : null}

      {view === "best" ? (
        best ? (
          <>
            <Alert>
              <AlertDescription>
                Best score: <span className="font-medium">{best.scoreLabel}</span> from the interview on {best.dateLabel}.
              </AlertDescription>
            </Alert>
            <FeedbackReport report={best.report} />
          </>
        ) : (
          <Alert>
            <AlertDescription>No scored attempt is available yet.</AlertDescription>
          </Alert>
        )
      ) : null}

      {view === "history" ? (
        <div className="space-y-6">
          <div className="space-y-3">
            {attempts.map((attempt, index) => {
              const isSelected = attempt.id === selectedId;
              const domains = attempt.report.domains;
              const shownDomains = domains.slice(0, 3);
              const hiddenCount = domains.length - shownDomains.length;
              return (
                <div
                  key={attempt.id}
                  className={cn(
                    "space-y-3 rounded-xl border bg-card p-4 sm:p-5",
                    isSelected && "border-foreground/40 shadow-sm",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <CalendarDays aria-hidden className="size-4 text-muted-foreground" />
                      <span className="font-medium">{attempt.dateLabel}</span>
                      <span className="text-muted-foreground">· Attempt {attempts.length - index}</span>
                      {index === 0 ? <Badge variant="secondary">Latest</Badge> : null}
                      {best && best.id === attempt.id ? <Badge variant="outline">Best</Badge> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-lg font-semibold">{attempt.scoreLabel}</span>
                      <ClearanceBadge clearance={attempt.clearance} />
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                        onClick={() => setSelectedId(attempt.id)}
                      >
                        <Eye aria-hidden />
                        View
                      </Button>
                    </div>
                  </div>

                  {domains.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {shownDomains.map((domain) => (
                        <span
                          key={domain.id}
                          className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs"
                        >
                          {domain.name}
                          <span className="font-mono font-semibold">{domain.rating || "—"}</span>
                        </span>
                      ))}
                      {hiddenCount > 0 ? (
                        <span className="inline-flex items-center px-1 py-1 text-xs text-muted-foreground">
                          +{hiddenCount} more
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {selected ? (
            <FeedbackReport report={selected.report} />
          ) : (
            <p className="text-sm text-muted-foreground">Select View on any attempt to open its full report.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
