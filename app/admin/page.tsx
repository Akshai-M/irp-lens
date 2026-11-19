import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { DownloadMarkdownButton } from "@/components/download-markdown-button";
import { FeedbackReport } from "@/components/feedback-report";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMAIL_PATTERN, lookupStudentRow } from "@/lib/feedback";
import { buildReportView, type ReportView } from "@/lib/report";
import { ADMIN_LOGIN, requireRole, type Role } from "@/lib/session";

// Reads the session cookie, so it must render per request.
export const instant = false;

type SearchParams = Promise<{ email?: string }>;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireRole(["admin", "admin_view"], ADMIN_LOGIN);
  const role: Role = session.role;

  if (role === "admin") {
    // Admins do not open student reports, because that would add to the metrics they review.
    return (
      <div className="flex min-h-dvh flex-col">
        <AppHeader title="IRP Assessment Report" />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold">User analytics</CardTitle>
              <CardDescription className="text-base text-foreground/70">
                Student activity on the report site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTitle>On hold</AlertTitle>
                <AlertDescription>
                  User analytics will be added after the database is connected.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Admin view: student reports only, looked up by email.
  const { email: rawEmail } = await searchParams;
  const email = (rawEmail ?? "").trim().toLowerCase();

  let report: ReportView | null = null;
  let body: ReactNode = null;
  if (email) {
    if (!EMAIL_PATTERN.test(email)) {
      body = (
        <Alert variant="destructive">
          <AlertDescription>Enter a valid email address.</AlertDescription>
        </Alert>
      );
    } else {
      const lookup = await lookupStudentRow(email);
      if (lookup.ok) {
        report = buildReportView(lookup.row);
        body = <FeedbackReport report={report} />;
      } else {
        body = (
          <Alert variant={lookup.reason === "not_found" ? "default" : "destructive"}>
            <AlertDescription>
              {lookup.reason === "not_found"
                ? "No interview feedback was found for this email."
                : "The feedback service is unavailable right now. Please try again shortly."}
            </AlertDescription>
          </Alert>
        );
      }
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        title="IRP Assessment Report"
        actions={report ? <DownloadMarkdownButton report={report} /> : undefined}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6 sm:py-10 print:py-0">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl font-semibold">Student reports</CardTitle>
            <CardDescription className="text-base text-foreground/70">
              Enter a student&apos;s interview email to view their feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form method="GET" className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="lookup-email" className="text-sm font-medium text-foreground">
                  Student email
                </Label>
                <Input
                  id="lookup-email"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  defaultValue={email}
                  required
                  className="h-11 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                View report
              </Button>
            </form>
          </CardContent>
        </Card>
        {body}
      </main>
    </div>
  );
}
