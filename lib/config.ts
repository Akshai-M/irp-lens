/**
 * Interview tracks. Each track has its own Apps Script deployment (`endpointEnv`) and its own
 * sub-sheet tab (`subsheet`). To add a track, add an entry here and set its env variable.
 */
export const TRACKS = [
  {
    id: "frontend",
    label: "Frontend Development",
    subsheet: "L1 Evaluation Sheet (from 8th sep)",
    endpointEnv: "APPS_SCRIPT_URL",
  },
  {
    id: "genai",
    label: "GenAI",
    subsheet: "Evauation sheet",
    endpointEnv: "APPS_SCRIPT_GENAI_URL",
  },
] as const;

export type Track = (typeof TRACKS)[number];
export type TrackId = Track["id"];

export function trackById(id: string): Track | undefined {
  return TRACKS.find((track) => track.id === id);
}
