"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import type { RefetchResult } from "@/app/actions/report";
import { DownloadMarkdownButton } from "@/components/download-markdown-button";
import { FeedbackReport } from "@/components/feedback-report";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ReportView } from "@/lib/report";

const CACHE_KEY = "irp-student-report";

/** Keeps a copy of the report in this browser. Storage can be blocked, so every access is guarded. */
function saveToCache(report: ReportView): string | null {
  const savedAt = new Date().toISOString();
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt, report }));
    return savedAt;
  } catch {
    return null;
  }
}

function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function StudentReport({
  initial,
  refetch,
}: {
  initial: ReportView;
  refetch: () => Promise<RefetchResult>;
}) {
  const [report, setReport] = useState(initial);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // First load: keep the data in local storage.
  useEffect(() => {
    saveToCache(initial);
  }, [initial]);

  function handleRefetch() {
    setError(null);
    startTransition(async () => {
      const result = await refetch();
      if (result.report) {
        setReport(result.report);
        setSavedAt(saveToCache(result.report));
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 print:hidden sm:justify-end">
        {savedAt ? (
          <span className="w-full text-sm text-foreground/70 sm:mr-auto sm:w-auto">
            Last updated {formatSavedAt(savedAt)}
          </span>
        ) : null}
        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleRefetch} disabled={pending}>
            <RefreshCw aria-hidden className={pending ? "size-4 animate-spin" : "size-4"} />
            {pending ? "Refetching" : "Refetch"}
          </Button>
          <DownloadMarkdownButton report={report} />
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FeedbackReport report={report} />
    </div>
  );
}
