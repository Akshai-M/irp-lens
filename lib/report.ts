import type { SheetRow } from "@/lib/feedback";

type Obj = Record<string, unknown>;

export type ConceptView = {
  name: string;
  status: string;
  statusLabel: string;
  wentWell: string;
  gap: string;
  toWorkOn: string;
};

export type DomainView = {
  id: string;
  name: string;
  rating: string;
  status: string;
  statusLabel: string;
  summary: string;
  strongerLooksLike: string;
  wentWell: string[];
  improvements: string[];
  concepts: ConceptView[];
  actionItems: string[];
  /** Scoring breakdown from the sheet (fallback only). */
  breakdown: string[];
};

export type WeekView = {
  week: string;
  focus: string;
  why: string;
  target: string;
  tasks: string[];
};

export type ReportView = {
  source: "raw" | "fallback";
  candidateName: string;
  candidateEmail: string;
  track: string;
  interviewDate: string;
  clearanceStatus: string;
  overallScore: string;
  executiveSummary: string;
  contextNote: string;
  integrityScore: string;
  overall: {
    summary: string;
    wentWell: string[];
    improvements: string[];
    actionItems: string[];
    nextStep: string;
  } | null;
  domains: DomainView[];
  weeklyPlan: WeekView[];
};

const STATUS_LABELS: Record<string, string> = {
  strong: "Strong",
  partly_there: "Partly There",
  needs_work: "Needs Work",
  not_yet_familiar: "Not Yet Familiar",
};

export function statusLabel(status: string): string {
  if (!status) return "";
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

const isObj = (value: unknown): value is Obj =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value).trim();

/** Accepts an array, or a string whose items are separated by "|". */
const items = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  return text(value)
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
};

const objects = (value: unknown): Obj[] => (Array.isArray(value) ? value.filter(isObj) : []);

function formatIsoDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/**
 * Parses the raw_feedback cell. It is stored as a JSON string in the sheet.
 * The internal_only block holds staff notes, so it is removed before anything reaches the student.
 */
export function parseRawFeedback(value: unknown): Obj | null {
  let parsed: unknown = value;
  if (typeof value === "string") {
    if (!value.trim()) return null;
    try {
      parsed = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!isObj(parsed)) return null;

  const studentSafe: Obj = { ...parsed };
  delete studentSafe.internal_only;
  const usable = isObj(studentSafe.result) || Array.isArray(studentSafe.domains);
  return usable ? studentSafe : null;
}

function conceptFromRaw(concept: Obj): ConceptView {
  const status = text(concept.status);
  return {
    name: text(concept.concept_area),
    status,
    statusLabel: statusLabel(status),
    wentWell: text(concept.what_went_well),
    gap: text(concept.the_gap),
    toWorkOn: text(concept.what_to_work_on),
  };
}

function domainFromRaw(domain: Obj): DomainView {
  const status = text(domain.status);
  return {
    id: text(domain.domain_id),
    name: text(domain.domain_name),
    rating: text(domain.domain_rating),
    status,
    statusLabel: statusLabel(status),
    summary: text(domain.performance_summary),
    strongerLooksLike: text(domain.stronger_performance_looks_like),
    wentWell: items(domain.what_went_well),
    improvements: items(domain.areas_of_improvement),
    concepts: objects(domain.concept_areas).map(conceptFromRaw),
    actionItems: items(domain.action_items),
    breakdown: [],
  };
}

function weekFromRaw(week: Obj): WeekView {
  return {
    week: text(week.week),
    focus: text(week.focus),
    why: text(week.why),
    target: text(week.target),
    tasks: items(week.tasks),
  };
}

function fromRaw(raw: Obj, row: SheetRow): ReportView {
  const meta = isObj(raw.report_meta) ? raw.report_meta : {};
  const result = isObj(raw.result) ? raw.result : {};
  const overall = isObj(raw.overall) ? raw.overall : null;

  return {
    source: "raw",
    candidateName: text(meta.candidate_name) || text(row["Candidate Name"]),
    candidateEmail: text(meta.candidate_email) || text(row["Candidate Email"]),
    track: text(meta.track) || text(row["Round"]),
    interviewDate: formatIsoDate(text(meta.interview_date)) || text(row["Date"]),
    clearanceStatus: text(result.clearance_status) || text(row["Clearance Status"]),
    overallScore: text(result.overall_score) || text(row["Final Verdict"]),
    executiveSummary: text(result.executive_summary) || text(row["Overall Remarks"]),
    contextNote: text(raw.context_note),
    integrityScore: text(row["Integrity Score"]),
    overall: overall
      ? {
          summary: text(overall.evaluation_summary),
          wentWell: items(overall.what_went_well),
          improvements: items(overall.areas_of_improvement),
          actionItems: items(overall.action_items),
          nextStep: text(overall.next_step_focus),
        }
      : null,
    domains: objects(raw.domains).map(domainFromRaw),
    weeklyPlan: objects(raw.weekly_plan).map(weekFromRaw),
  };
}

/** Default values from the sheet's own columns, used when raw_feedback is missing or unreadable. */
const SHEET_DOMAINS = [
  { id: "take_home", name: "Take-Home Assignment Drill-Down" },
  { id: "frontend_concepts", name: "Frontend Conceptual Discussion" },
  { id: "react_coding", name: "React Live Coding" },
  { id: "communication", name: "Communication skills" },
];

function fromSheet(row: SheetRow): ReportView {
  return {
    source: "fallback",
    candidateName: text(row["Candidate Name"]),
    candidateEmail: text(row["Candidate Email"]),
    track: text(row["Round"]),
    interviewDate: text(row["Date"]),
    clearanceStatus: text(row["Clearance Status"]),
    overallScore: text(row["Final Verdict"]),
    executiveSummary: text(row["Overall Remarks"]),
    contextNote: "",
    integrityScore: text(row["Integrity Score"]),
    overall: null,
    domains: SHEET_DOMAINS.map((domain) => ({
      id: domain.id,
      name: domain.name,
      rating: text(row[`${domain.name} – Domain Rating`]),
      status: "",
      statusLabel: "",
      summary: text(row[`${domain.name} – Remarks`]),
      strongerLooksLike: "",
      wentWell: [],
      improvements: [],
      concepts: [],
      actionItems: [],
      breakdown: items(row[domain.name]),
    })),
    weeklyPlan: [],
  };
}

/** Uses raw_feedback when it is readable. Otherwise falls back to the sheet's default columns. */
export function buildReportView(row: SheetRow): ReportView {
  const raw = parseRawFeedback(row["raw_feedback"]);
  return raw ? fromRaw(raw, row) : fromSheet(row);
}
