"use client";

import { MessageSquareText } from "lucide-react";
import { Cover } from "@/components/ui/cover";

const MENTOR_URL = "https://forms.ccbp.in/interview-report-dashboard";

/** Floating "Connect with Mentor" link, shown on every page. Uses Aceternity's Cover for the animation. */
export function MentorButton() {
  return (
    <a
      href={MENTOR_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="print:hidden fixed right-4 z-50 flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 sm:right-6"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <Cover
        alwaysSparkle
        containerClassName="block overflow-hidden rounded-full bg-slate-900 px-4 py-2.5 hover:bg-slate-800 dark:bg-slate-900"
        className="inline-flex items-center gap-2 text-sm font-medium text-white dark:text-white group-hover/cover:text-white"
      >
        <MessageSquareText aria-hidden className="size-4" />
        Connect with Mentor
      </Cover>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
