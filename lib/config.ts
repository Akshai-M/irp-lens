/**
 * Sub-sheets (tabs) in the Apps Script spreadsheet that hold interview rows.
 * Add a new tab name here when a new track (for example Backend or Gen AI) is added.
 * They are searched in this order, and the first row matching the student's email is used.
 */
export const SUBSHEETS: readonly string[] = ["L1 Evaluation Sheet (from 8th sep)"];
