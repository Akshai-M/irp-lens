import { redirect } from "next/navigation";
import { getSession, homePathFor } from "@/lib/session";

// Reads the session cookie, so it must render per request.
export const instant = false;

export default async function Home() {
  const session = await getSession();
  redirect(session ? homePathFor(session.role) : "/login");
}
