import { fetchMedium } from "@/lib/medium";
import { fetchGitHub } from "@/lib/github";
import { logTimelineItems } from "@/lib/log";
import { mergeTimeline } from "@/lib/merge";
import HeaderCard from "@/components/HeaderCard";
import TimelineRow from "@/components/TimelineRow";

export const revalidate = 0;

export default async function Home() {
  const [medium, github, log] = await Promise.all([
    fetchMedium(),
    fetchGitHub(),
    logTimelineItems(),
  ]);
  const { items } = mergeTimeline([medium, github, log]);

  return (
    <>
      <HeaderCard />
      <section>
        <h2 className="text-[12.5px] font-mono uppercase tracking-[0.3px] text-(--color-muted) mb-3">
          Recent activity
        </h2>
        <ul className="list-none p-0">
          {items.map((item) => (
            <TimelineRow key={item.id} item={item} />
          ))}
        </ul>
      </section>
    </>
  );
}
