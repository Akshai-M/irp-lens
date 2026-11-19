"use client";

import { CircleDotDashed } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminLogin, studentLogin, type LoginState } from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <CircleDotDashed className="animate-spin" aria-hidden />
          {busy}
        </>
      ) : (
        idle
      )}
    </Button>
  );
}

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

export function StudentLoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(studentLogin, undefined);
  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="student-email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <Input
          id="student-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="h-11 text-base"
        />
      </div>
      <ErrorMessage error={state?.error} />
      <SubmitButton idle="View my feedback" busy="Checking" />
    </form>
  );
}

export function AdminLoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(adminLogin, undefined);
  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="admin-username" className="text-sm font-medium text-foreground">
          Username
        </Label>
        <Input
          id="admin-username"
          name="username"
          autoComplete="username"
          required
          className="h-11 text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-password" className="text-sm font-medium text-foreground">
          Password
        </Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 text-base"
        />
      </div>
      <ErrorMessage error={state?.error} />
      <SubmitButton idle="Sign in" busy="Signing in" />
    </form>
  );
}
