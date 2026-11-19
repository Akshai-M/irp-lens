import Image from "next/image";

export function PoweredBy() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/60">Powered by</span>
      <Image
        src="/nxtwave-academy-logo.jpeg"
        alt="NxtWave Academy"
        width={32}
        height={32}
        className="size-8 rounded-md"
      />
    </div>
  );
}
