import { SUBSHEETS } from "./config";

export type SheetRow = Record<string, unknown>;

export type StudentLookup =
  | { ok: true; row: SheetRow }
  | { ok: false; reason: "not_found" | "unavailable" | "not_configured" };

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Fetches the interview row for one email from the Apps Script endpoint.
 * Every sub-sheet is requested with its own `subsheet` parameter, and the first matching row is used.
 * Runs on the server only, so the Apps Script URL never reaches the browser.
 */
export async function lookupStudentRow(rawEmail: string): Promise<StudentLookup> {
  const baseUrl = process.env.APPS_SCRIPT_URL;
  if (!baseUrl || SUBSHEETS.length === 0) {
    return { ok: false, reason: "not_configured" };
  }

  const email = rawEmail.trim().toLowerCase();
  const url = new URL(baseUrl);
  for (const subsheet of SUBSHEETS) {
    url.searchParams.append("subsheet", subsheet);
  }
  url.searchParams.set("email", email);

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(25_000) });
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (!response.ok) return { ok: false, reason: "unavailable" };

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { ok: false, reason: "unavailable" };
  }

  const results = (body as { results?: Record<string, { data?: unknown }> })?.results ?? {};

  for (const subsheet of SUBSHEETS) {
    const section = results[subsheet];
    const rows = Array.isArray(section?.data) ? (section.data as SheetRow[]) : [];
    const match = rows.find(
      (row) => String(row["Candidate Email"] ?? "").trim().toLowerCase() === email,
    );
    if (match) return { ok: true, row: match };
  }

  return { ok: false, reason: "not_found" };
}
