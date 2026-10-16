import { HiOutlinePhoto } from "react-icons/hi2";
import { cn } from "@/lib/cn";

export function ProductThumbnail({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-glass-border bg-white/50", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <HiOutlinePhoto className="h-1/2 w-1/2 text-ink-muted/50" aria-hidden />
      )}
    </div>
  );
}
