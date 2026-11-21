import { TRACKS, type TrackId } from "@/lib/config";
import { lookupStudentRows, type SheetRow, type StudentLookup } from "@/lib/feedback";
import { buildReportView, type ReportView } from "@/lib/report";

/** One interview attempt for one track. */
export type Attempt = {
  id: string;
  trackId: TrackId;
  /** Submission time in milliseconds, or null when the sheet has no usable date. */
  submittedAt: number | null;
  dateLabel: string;
  /** Numeric overall score, or null when it cannot be read. */
  score: number | null;
  scoreLabel: string;
  clearance: string;
  report: ReportView;
};

/** Every attempt the student has, per track, newest first. */
export type StudentRecord = Record<TrackId, Attempt[]>;

function submittedAt(row: SheetRow): number | null {
  const candidates = [row["Feedback Submitted At"], [row["Date"], row["Time"]].filter(Boolean).join(" ")];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const time = Date.parse(String(candidate));
    if (!Number.isNaN(time)) return time;
  }
  return null;
}

function toAttempt(trackId: TrackId, row: SheetRow, index: number): Attempt {
  const report = buildReportView(row);
  const parsed = Number.parseFloat(report.overallScore);
  const time = submittedAt(row);
  return {
    id: String(row["UID"] ?? "").trim() || `${trackId}-${index}`,
    trackId,
    submittedAt: time,
    dateLabel: time !== null ? new Date(time).toLocaleDateString("en-IN", { dateStyle: "medium" }) : report.interviewDate,
    score: Number.isNaN(parsed) ? null : parsed,
    scoreLabel: report.overallScore || "—",
    clearance: report.clearanceStatus,
    report,
  };
}

/** Newest first. Attempts without a date go last. */
export function sortLatestFirst(attempts: Attempt[]): Attempt[] {
  return [...attempts].sort((a, b) => (b.submittedAt ?? -Infinity) - (a.submittedAt ?? -Infinity));
}

/** Highest score wins. On a tie the newer attempt wins. */
export function pickBest(attempts: Attempt[]): Attempt | null {
  let best: Attempt | null = null;
  for (const attempt of sortLatestFirst(attempts)) {
    if (attempt.score === null) continue;
    if (best === null || attempt.score > (best.score ?? -Infinity)) best = attempt;
  }
  return best;
}

export function buildStudentRecord(rows: Record<TrackId, SheetRow[]>): StudentRecord {
  const record = {} as StudentRecord;
  for (const track of TRACKS) {
    const attempts = (rows[track.id] ?? []).map((row, index) => toAttempt(track.id, row, index));
    record[track.id] = sortLatestFirst(attempts);
  }
  return record;
}

export type StudentLoad =
  | { ok: true; record: StudentRecord; unavailable: TrackId[] }
  | Extract<StudentLookup, { ok: false }>;

/** Loads and groups every attempt for one student. Shared by the pages and the actions. */
export async function loadStudentRecord(email: string): Promise<StudentLoad> {
  const lookup = await lookupStudentRows(email);
  if (!lookup.ok) return lookup;
  return { ok: true, record: buildStudentRecord(lookup.rows), unavailable: lookup.unavailable };
}

export function totalAttempts(record: StudentRecord): number {
  return TRACKS.reduce((sum, track) => sum + record[track.id].length, 0);
}
