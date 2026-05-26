import Link from "next/link";
import { readLogEntries } from "@/lib/log";
import { format, parseISO } from "date-fns";

export const revalidate = 0;

export default async function LogPage() {
  const entries = await readLogEntries();

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-[26px] font-bold uppercase tracking-[2.5px] mb-1 text-(--color-ink)">
          Log
        </h1>
        <div className="text-[12.5px] font-mono text-(--color-muted) tracking-[0.3px]">
          Working notes
        </div>
      </header>
      <hr className="border-(--color-border) mb-9" />

      <ul className="flex flex-col gap-7">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/log/${e.slug}`}
              className="no-underline group block"
            >
              <h2 className="text-[16px] font-semibold text-(--color-ink) group-hover:opacity-60 transition leading-snug">
                {e.title}
              </h2>
              <time
                className="text-[12px] text-(--color-muted) tabular-nums"
                dateTime={e.date}
              >
                {format(parseISO(e.date), "MMM d, yyyy")}
              </time>
              <p className="text-[15px] text-[#555] leading-relaxed mt-1.5 line-clamp-2">
                {e.excerpt}
              </p>
            </Link>
          </li>
        ))}
        {entries.length === 0 && <li className="text-(--color-muted)">No public log entries yet.</li>}
      </ul>
    </section>
  );
}
