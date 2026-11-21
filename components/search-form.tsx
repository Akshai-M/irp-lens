"use client";

import { CircleDotDashed, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Admin email search. Shows a spinner until the next results have rendered. */
export function SearchForm({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState(defaultValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ email: email.trim() });
    startTransition(() => router.push(`/admin?${params.toString()}`));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="lookup-email" className="text-sm font-medium text-foreground">
          Student email
        </Label>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="lookup-email"
            name="email"
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={pending}
            className="h-11 pl-9 text-base"
          />
        </div>
      </div>
      <Button type="submit" size="lg" disabled={pending} className="w-full gap-2 sm:w-auto">
        {pending ? (
          <>
            <CircleDotDashed aria-hidden className="animate-spin" />
            Searching
          </>
        ) : (
          <>
            <Search aria-hidden />
            Search
          </>
        )}
      </Button>
    </form>
  );
}
