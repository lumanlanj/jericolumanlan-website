import type { Source } from "@/lib/types";

const LABELS: Record<Source, string> = {
  medium: "WRITING",
  github: "CODE",
  log: "LOG",
};

const COLORS: Record<Source, string> = {
  medium: "text-emerald-700 bg-emerald-50 border-emerald-200",
  github: "text-violet-700 bg-violet-50 border-violet-200",
  log: "text-amber-700 bg-amber-50 border-amber-200",
};

export default function SourceBadge({ source }: { source: Source }) {
  return (
    <span
      className={`inline-block text-[10px] font-medium uppercase tracking-wider border px-1.5 py-0.5 rounded-sm ${COLORS[source]}`}
    >
      {LABELS[source]}
    </span>
  );
}
