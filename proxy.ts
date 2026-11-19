import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "irp_session";

/**
 * Fast first check: a visitor without a session cookie is sent to the right login with a real 307.
 * The signature, expiry and role are verified in each protected page (see lib/session.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The admin login page itself must stay reachable without a session.
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/report", "/admin/:path*", "/admin"],
};
