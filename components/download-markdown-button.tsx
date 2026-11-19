"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markdownFileName, reportToMarkdown } from "@/lib/report-markdown";
import type { ReportView } from "@/lib/report";

export function DownloadMarkdownButton({ report }: { report: ReportView }) {
  function handleDownload() {
    const blob = new Blob([reportToMarkdown(report)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = markdownFileName(report);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" size="sm" className="gap-2" onClick={handleDownload}>
      <Download aria-hidden className="size-4" />
      Download (.md)
    </Button>
  );
}
