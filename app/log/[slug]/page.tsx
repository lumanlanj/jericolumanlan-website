import { notFound } from "next/navigation";
import { readLogEntries } from "@/lib/log";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import Container from "@/components/Container";

export const revalidate = 0;

export async function generateStaticParams() {
  const entries = await readLogEntries();
  return entries.map((e) => ({ slug: e.slug }));
}

export default async function LogEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entries = await readLogEntries();
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) notFound();

  const processed = await remark().use(remarkHtml).process(entry.body);
  const html = processed.toString();

  return (
    <Container>
    <article>
      <Link
        href="/log"
        className="text-[13px] text-(--color-muted) hover:text-(--color-ink) transition no-underline"
      >
        ← Log
      </Link>
      <header className="mt-4 mb-8">
        <h1 className="text-[24px] font-bold text-(--color-ink) leading-tight mb-2">
          {entry.title}
        </h1>
        <time className="text-[13px] text-(--color-muted) tabular-nums" dateTime={entry.date}>
          {format(parseISO(entry.date), "MMMM d, yyyy")}
        </time>
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {entry.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] uppercase tracking-wider text-(--color-muted)"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </header>
      <div
        className="prose-content text-[16px] text-(--color-bio) leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
    </Container>
  );
}
