import Image from "next/image";

export function PoweredBy() {
  return (
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-foreground/70">
      <span className="hidden sm:inline">Powered by</span>
      <Image
        src="/nxtwave-academy-logo.jpeg"
        alt="NxtWave Academy"
        width={24}
        height={24}
        className="size-6 rounded-sm"
      />
      <span className="sr-only sm:not-sr-only sm:normal-case sm:text-sm sm:font-semibold sm:tracking-tight sm:text-foreground">
        NxtWave Academy
      </span>
    </div>
  );
}
