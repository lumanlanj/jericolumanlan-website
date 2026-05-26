import { fetchMedium } from "@/lib/medium";
import TimelineRow from "@/components/TimelineRow";

export const revalidate = 0;

export default async function WritingPage() {
  const items = await fetchMedium();

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-[26px] font-bold uppercase tracking-[2.5px] mb-1 text-(--color-ink)">
          Writing
        </h1>
        <div className="text-[12.5px] font-mono text-(--color-muted) tracking-[0.3px]">
          Essays on Medium
        </div>
      </header>
      <hr className="border-(--color-border) mb-9" />

      <ul className="list-none p-0">
        {items.map((item) => (
          <TimelineRow key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <li className="text-(--color-muted)">No posts available right now.</li>
        )}
      </ul>
    </section>
  );
}
