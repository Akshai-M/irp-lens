import { TRACKS, type Track, type TrackId } from "@/lib/config";

export type SheetRow = Record<string, unknown>;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type TrackRows = Record<TrackId, SheetRow[]>;

export type StudentLookup =
  | {
      ok: true;
      rows: TrackRows;
      /** Tracks whose endpoint could not be reached. Their rows are empty, so the UI can say so. */
      unavailable: TrackId[];
    }
  | { ok: false; reason: "not_found" | "unavailable" | "not_configured" };

/** Reads one track's sub-sheet for one email. Returns null when that track could not be read. */
async function fetchTrackRows(track: Track, baseUrl: string, email: string): Promise<SheetRow[] | null> {
  const url = new URL(baseUrl);
  url.searchParams.append("subsheet", track.subsheet);
  url.searchParams.set("email", email);

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(25_000) });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return null;
  }

  const results = (body as { results?: Record<string, { data?: unknown }> })?.results ?? {};
  const section = results[track.subsheet];
  const rows = Array.isArray(section?.data) ? (section.data as SheetRow[]) : [];
  return rows.filter((row) => String(row["Candidate Email"] ?? "").trim().toLowerCase() === email);
}

/**
 * Fetches every interview the student has, across all tracks. Each track is read from its own
 * Apps Script endpoint. Runs on the server only, so the URLs never reach the browser.
 */
export async function lookupStudentRows(rawEmail: string): Promise<StudentLookup> {
  const email = rawEmail.trim().toLowerCase();
  const configured = TRACKS.flatMap((track) => {
    const baseUrl = process.env[track.endpointEnv];
    return baseUrl ? [{ track, baseUrl }] : [];
  });
  if (configured.length === 0) return { ok: false, reason: "not_configured" };

  const results = await Promise.all(
    configured.map(async ({ track, baseUrl }) => ({
      id: track.id,
      rows: await fetchTrackRows(track, baseUrl, email),
    })),
  );

  const rows = {} as TrackRows;
  for (const track of TRACKS) rows[track.id] = [];
  const unavailable: TrackId[] = [];
  for (const result of results) {
    if (result.rows === null) unavailable.push(result.id);
    else rows[result.id] = result.rows;
  }

  if (unavailable.length === configured.length) return { ok: false, reason: "unavailable" };
  const found = Object.values(rows).some((list) => list.length > 0);
  if (!found) {
    return unavailable.length > 0 ? { ok: false, reason: "unavailable" } : { ok: false, reason: "not_found" };
  }
  return { ok: true, rows, unavailable };
}
