import { createHash, timingSafeEqual } from "node:crypto";

export type AdminRole = "admin" | "admin_view";

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function same(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

function matches(username: string, password: string, expectedUser?: string, expectedPassword?: string): boolean {
  if (!expectedUser || !expectedPassword) return false;
  // Compare both fields every time so timing does not reveal which one was wrong.
  const userOk = same(username, expectedUser);
  const passwordOk = same(password, expectedPassword);
  return userOk && passwordOk;
}

/**
 * Works out the admin role from the username and password entered.
 * The credentials decide the role, so the login form does not ask for one.
 */
export function resolveAdminRole(username: string, password: string): AdminRole | null {
  if (matches(username, password, process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD)) {
    return "admin";
  }
  if (matches(username, password, process.env.ADMIN_VIEW_USERNAME, process.env.ADMIN_VIEW_PASSWORD)) {
    return "admin_view";
  }
  return null;
}
