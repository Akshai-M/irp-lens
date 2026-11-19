import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ConceptView, DomainView, ReportView } from "@/lib/report";

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "strong":
      return "default";
    case "needs_work":
      return "destructive";
    case "partly_there":
      return "secondary";
    default:
      return "outline";
  }
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  if (!label) return null;
  return <Badge variant={statusVariant(status)}>{label}</Badge>;
}

function BulletList({ items, tone }: { items: string[]; tone: "good" | "improve" | "plain" }) {
  if (items.length === 0) return null;
  const color = tone === "good" ? "text-emerald-600" : tone === "improve" ? "text-rose-600" : "text-muted-foreground";
  return (
    <ul className="space-y-2 text-sm leading-relaxed">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2">
          <span className={`mt-1.5 size-1.5 shrink-0 rounded-full bg-current ${color}`} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ConceptRow({ concept }: { concept: ConceptView }) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{concept.name}</p>
        <StatusBadge status={concept.status} label={concept.statusLabel} />
      </div>
      {concept.wentWell ? <p className="text-sm"><span className="font-medium">What went well: </span>{concept.wentWell}</p> : null}
      {concept.gap ? <p className="text-sm"><span className="font-medium">The gap: </span>{concept.gap}</p> : null}
      {concept.toWorkOn ? <p className="text-sm"><span className="font-medium">What to work on: </span>{concept.toWorkOn}</p> : null}
    </div>
  );
}

function DomainDetail({ domain }: { domain: DomainView }) {
  return (
    <div className="space-y-6">
        {domain.summary ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Performance summary</p>
            <p className="text-sm leading-relaxed">{domain.summary}</p>
          </div>
        ) : null}
        {domain.strongerLooksLike ? (
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p className="mb-1 font-medium">What stronger performance looks like</p>
            <p className="text-muted-foreground">{domain.strongerLooksLike}</p>
          </div>
        ) : null}

        {domain.wentWell.length > 0 || domain.improvements.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-700">What went well</p>
              <BulletList items={domain.wentWell} tone="good" />
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-rose-700">Areas of improvement</p>
              <BulletList items={domain.improvements} tone="improve" />
            </div>
          </div>
        ) : null}

        {domain.concepts.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Concept areas ({domain.concepts.length})
            </p>
            {domain.concepts.map((concept) => (
              <ConceptRow key={concept.name} concept={concept} />
            ))}
          </div>
        ) : null}

        {domain.breakdown.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Scoring breakdown</p>
            <BulletList items={domain.breakdown} tone="plain" />
          </div>
        ) : null}

        {domain.actionItems.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Action items</p>
            <BulletList items={domain.actionItems} tone="plain" />
          </div>
        ) : null}
    </div>
  );
}

export function FeedbackReport({ report }: { report: ReportView }) {
  const cleared = report.clearanceStatus.toLowerCase() === "cleared";

  return (
    <div className="space-y-8">
      {report.source === "fallback" ? (
        <Alert>
          <AlertDescription>
            The full written feedback is not available yet. Showing the scores and remarks from the interview sheet.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0">
          <CardHeader>
            <CardDescription className="flex flex-wrap gap-x-2 text-xs">
              {report.track ? <span>{report.track}</span> : null}
              {report.track && report.interviewDate ? <span>·</span> : null}
              {report.interviewDate ? <span>Interview date: {report.interviewDate}</span> : null}
            </CardDescription>
            <CardTitle className="break-words font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {report.candidateName || "Student"}
            </CardTitle>
            <CardDescription className="break-all">{report.candidateEmail}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Executive summary</p>
            <p className="leading-relaxed">{report.executiveSummary || "No summary is available yet."}</p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="divide-y pt-6 text-sm">
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Clearance status</span>
              {report.clearanceStatus ? (
                <Badge variant={cleared ? "default" : "destructive"}>{report.clearanceStatus}</Badge>
              ) : (
                <span>—</span>
              )}
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Overall score</span>
              <span className="font-mono text-2xl font-semibold">{report.overallScore || "—"}</span>
            </div>
            {report.integrityScore ? (
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Integrity score</span>
                <span className="font-mono">{report.integrityScore}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      {report.contextNote ? (
        <Alert>
          <AlertDescription>
            <span className="font-medium">Session preparation note: </span>
            {report.contextNote}
          </AlertDescription>
        </Alert>
      ) : null}

      {report.overall ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Section 01</p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Overall evaluation</h2>
          </div>
          <Card>
            <CardContent className="space-y-6 pt-6">
              {report.overall.summary ? <p className="leading-relaxed">{report.overall.summary}</p> : null}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-700">What went well</p>
                  <BulletList items={report.overall.wentWell} tone="good" />
                </div>
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-rose-700">Areas of improvement</p>
                  <BulletList items={report.overall.improvements} tone="improve" />
                </div>
              </div>
              {report.overall.actionItems.length > 0 ? (
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recommended action items</p>
                  <BulletList items={report.overall.actionItems} tone="plain" />
                </div>
              ) : null}
              {report.overall.nextStep ? (
                <div className="rounded-lg border p-4 text-sm">
                  <p className="mb-1 font-medium">Next step focus</p>
                  <p className="text-muted-foreground">{report.overall.nextStep}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>
      ) : null}

      {report.domains.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Section 02</p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Domain breakdown</h2>
          </div>
          <Tabs defaultValue={report.domains[0].id} className="flex w-full min-w-0 flex-col gap-4">
            <TabsList className="grid h-auto! w-full grid-cols-1 gap-3 bg-transparent p-0 sm:grid-cols-2 lg:grid-cols-4">
              {report.domains.map((domain) => (
                <TabsTrigger
                  key={domain.id}
                  value={domain.id}
                  className="h-auto flex-col items-stretch justify-start gap-3 whitespace-normal rounded-xl border-foreground/15 bg-card p-4 text-left text-foreground shadow-xs after:hidden data-active:border-foreground/70 data-active:bg-card data-active:shadow-md dark:border-foreground/20 dark:data-active:border-foreground/70 dark:data-active:bg-card"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium">{domain.name}</span>
                    <span className="font-mono text-lg">{domain.rating || "—"}</span>
                  </span>
                  <StatusBadge status={domain.status} label={domain.statusLabel} />
                </TabsTrigger>
              ))}
            </TabsList>
            {report.domains.map((domain) => (
              <TabsContent key={domain.id} value={domain.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex flex-wrap items-center gap-3 font-heading text-xl font-semibold">
                      {domain.name}
                      <StatusBadge status={domain.status} label={domain.statusLabel} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DomainDetail domain={domain} />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>
      ) : null}

      {report.weeklyPlan.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Section 03</p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Study plan</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {report.weeklyPlan.map((week) => (
              <Card key={week.week}>
                <CardHeader>
                  <CardDescription className="text-xs uppercase tracking-wider">Week {week.week}</CardDescription>
                  <CardTitle className="font-heading text-xl font-semibold">{week.focus}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {week.why ? (
                    <div>
                      <p className="font-medium">Why this matters</p>
                      <p className="text-muted-foreground">{week.why}</p>
                    </div>
                  ) : null}
                  {week.target ? (
                    <div>
                      <p className="font-medium">Target outcome</p>
                      <p className="text-muted-foreground">{week.target}</p>
                    </div>
                  ) : null}
                  {week.tasks.length > 0 ? (
                    <div>
                      <p className="mb-2 font-medium">Tasks</p>
                      <BulletList items={week.tasks} tone="plain" />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
