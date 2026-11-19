import { redirect } from "next/navigation";
import { StudentLoginForm } from "@/components/login-form";
import { PoweredBy } from "@/components/powered-by";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession, homePathFor } from "@/lib/session";

// Reads the session cookie, so it must render per request.
export const instant = false;

export default async function StudentLoginPage() {
  const session = await getSession();
  if (session) redirect(homePathFor(session.role));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">IRP Assessment Report</h1>
          <PoweredBy />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <Card className="w-full max-w-md gap-6 py-8">
          <CardHeader className="gap-2 px-6 sm:px-8">
            <CardTitle className="font-heading text-2xl font-semibold text-foreground">
              Student sign in
            </CardTitle>
            <CardDescription className="text-base leading-relaxed text-foreground/70">
              Enter the email you used for your interview to view your feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8">
            <StudentLoginForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
