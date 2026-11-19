import type { ReportView } from "@/lib/report";

/** Escapes a value for use inside a markdown table cell. */
const cell = (value: string) => value.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");

export function markdownFileName(report: ReportView): string {
  const base = report.candidateName || report.candidateEmail || "student";
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `IRP-feedback-${slug || "student"}.md`;
}

/**
 * Builds a markdown document from the same view model the UI renders.
 * Only what is shown to the student on screen is included. Internal fields are never in the view model.
 */
export function reportToMarkdown(report: ReportView): string {
  const out: string[] = [];
  const add = (...lines: string[]) => out.push(...lines);
  const para = (text: string) => {
    if (text) add(text, "");
  };
  const list = (items: string[]) => {
    if (items.length) add(...items.map((item) => `- ${item}`), "");
  };

  add(`# Interview feedback: ${report.candidateName || "Student"}`, "");
  const meta = [report.track, report.interviewDate ? `Interview date: ${report.interviewDate}` : ""].filter(Boolean);
  if (meta.length) para(meta.join(" · "));
  if (report.candidateEmail) para(`Email: ${report.candidateEmail}`);

  add("## Summary", "");
  const summary: string[] = [];
  if (report.clearanceStatus) summary.push(`- **Clearance status:** ${report.clearanceStatus}`);
  if (report.overallScore) summary.push(`- **Overall score:** ${report.overallScore}`);
  if (report.integrityScore) summary.push(`- **Integrity score:** ${report.integrityScore}`);
  if (summary.length) add(...summary, "");

  if (report.executiveSummary) {
    add("### Executive summary", "");
    para(report.executiveSummary);
  }
  if (report.contextNote) {
    add("### Session preparation note", "");
    para(report.contextNote);
  }

  if (report.overall) {
    add("## Overall evaluation", "");
    para(report.overall.summary);
    if (report.overall.wentWell.length) {
      add("### What went well", "");
      list(report.overall.wentWell);
    }
    if (report.overall.improvements.length) {
      add("### Areas of improvement", "");
      list(report.overall.improvements);
    }
    if (report.overall.actionItems.length) {
      add("### Recommended action items", "");
      list(report.overall.actionItems);
    }
    if (report.overall.nextStep) {
      add("### Next step focus", "");
      para(report.overall.nextStep);
    }
  }

  if (report.domains.length) {
    add("## Domain breakdown", "");
    add("| Domain | Rating | Status |", "| --- | --- | --- |");
    for (const domain of report.domains) {
      add(`| ${cell(domain.name)} | ${cell(domain.rating || "—")} | ${cell(domain.statusLabel || "—")} |`);
    }
    add("");

    for (const domain of report.domains) {
      add(`### ${domain.name}`, "");
      const head = [
        domain.rating ? `Rating: ${domain.rating}` : "",
        domain.statusLabel ? `Status: ${domain.statusLabel}` : "",
      ].filter(Boolean);
      if (head.length) para(head.join(" · "));
      para(domain.summary);

      if (domain.strongerLooksLike) {
        add("**What stronger performance looks like**", "");
        para(domain.strongerLooksLike);
      }
      if (domain.wentWell.length) {
        add("**What went well**", "");
        list(domain.wentWell);
      }
      if (domain.improvements.length) {
        add("**Areas of improvement**", "");
        list(domain.improvements);
      }
      if (domain.concepts.length) {
        add(`**Concept areas (${domain.concepts.length})**`, "");
        for (const concept of domain.concepts) {
          add(`- **${concept.name}**${concept.statusLabel ? ` (${concept.statusLabel})` : ""}`);
          if (concept.wentWell) add(`  - What went well: ${concept.wentWell}`);
          if (concept.gap) add(`  - The gap: ${concept.gap}`);
          if (concept.toWorkOn) add(`  - What to work on: ${concept.toWorkOn}`);
        }
        add("");
      }
      if (domain.breakdown.length) {
        add("**Scoring breakdown**", "");
        list(domain.breakdown);
      }
      if (domain.actionItems.length) {
        add("**Action items**", "");
        list(domain.actionItems);
      }
    }
  }

  if (report.weeklyPlan.length) {
    add("## Study plan", "");
    for (const week of report.weeklyPlan) {
      add(`### Week ${week.week}${week.focus ? `: ${week.focus}` : ""}`, "");
      if (week.why) add(`**Why this matters:** ${week.why}`, "");
      if (week.target) add(`**Target outcome:** ${week.target}`, "");
      if (week.tasks.length) {
        add("**Tasks**", "");
        list(week.tasks);
      }
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
