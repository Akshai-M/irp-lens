"use server";

import { redirect } from "next/navigation";
import { resolveAdminRole } from "@/lib/auth";
import { loadStudentRecord } from "@/lib/attempts";
import { EMAIL_PATTERN } from "@/lib/feedback";
import { clearSession, getSession, setSession } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

export async function studentLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const lookup = await loadStudentRecord(email);
  if (!lookup.ok) {
    if (lookup.reason === "not_found") {
      return { error: "No interview feedback was found for this email." };
    }
    return { error: "The feedback service is unavailable right now. Please try again shortly." };
  }

  await setSession({ role: "student", email });
  redirect("/report");
}

export async function adminLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return { error: "Enter both username and password." };
  }

  const role = resolveAdminRole(username, password);
  if (!role) {
    return { error: "Invalid username or password." };
  }

  await setSession({ role, username });
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const session = await getSession();
  await clearSession();
  redirect(session?.role === "student" || !session ? "/login" : "/admin/login");
}
