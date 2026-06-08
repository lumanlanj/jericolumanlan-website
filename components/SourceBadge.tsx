import type { Source } from "@/lib/types";

const LABELS: Record<Source, string> = {
  medium: "MEDIUM",
  substack: "SUBSTACK",
  github: "CODE",
  log: "LOG",
};

const COLORS: Record<Source, string> = {
  medium: "text-emerald-300/80",
  substack: "text-orange-300/85",
  github: "text-violet-300/80",
  log: "text-amber-300/80",
};

export default function SourceBadge({ source }: { source: Source }) {
  return (
    <span
      className={`inline-block font-mono text-[10px] uppercase tracking-[0.14em] ${COLORS[source]}`}
    >
      {LABELS[source]}
    </span>
  );
}
