import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export const SESSION_COOKIE = "irp_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export type Role = "student" | "admin_view" | "admin";

export type Session = {
  role: Role;
  /** Set for students: the email they signed in with. */
  email?: string;
  /** Set for admins: the username they signed in with. */
  username?: string;
  /** Expiry as epoch milliseconds. */
  exp: number;
};

type SessionInput = Omit<Session, "exp">;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Add it to .env.local.");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(input: SessionInput): string {
  const session: Session = { ...input, exp: Date.now() + MAX_AGE_SECONDS * 1000 };
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Pure check of the token. `now` is passed in so the caller decides when time is read. */
export function readSessionToken(token: string | undefined, now: number): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const session = parsed as Session;
    if (typeof session.exp !== "number" || session.exp < now) return null;
    if (session.role !== "student" && session.role !== "admin" && session.role !== "admin_view") {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function setSession(input: SessionInput): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(input), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  // Expiry depends on the current time, so the request must be dynamic before reading it.
  await connection();
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value, Date.now());
}

export function homePathFor(role: Role): string {
  return role === "student" ? "/report" : "/admin";
}

/** Where a signed-out visitor goes for each area. */
export const STUDENT_LOGIN = "/login";
export const ADMIN_LOGIN = "/admin/login";

/** Redirects when signed out, or when the role is not allowed on this page. */
export async function requireRole(allowed: Role[], loginPath: string): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(loginPath);
  if (!allowed.includes(session.role)) redirect(homePathFor(session.role));
  return session;
}
