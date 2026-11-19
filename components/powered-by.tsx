import Image from "next/image";

export function PoweredBy() {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-foreground/60 sm:text-xs">Powered by</span>
      <Image
        src="/nxtwave-academy-logo.jpeg"
        alt="NxtWave Academy"
        width={56}
        height={56}
        sizes="(min-width: 640px) 56px, 48px"
        className="size-12 rounded-md sm:size-14"
      />
    </div>
  );
}
