import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { PoweredBy } from "@/components/powered-by";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  title: string;
  showPrint?: boolean;
};

export function AppHeader({ title, showPrint = false }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h1>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {showPrint ? <PrintButton /> : null}
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm" className="gap-2">
              <LogOut aria-hidden className="size-4" />
              Sign out
            </Button>
          </form>
          <div className="hidden h-6 w-px bg-border sm:block" aria-hidden />
          <PoweredBy />
        </div>
      </div>
    </header>
  );
}
