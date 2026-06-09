import Link from "next/link";
import { fetchMedium } from "@/lib/medium";
import { fetchSubstack } from "@/lib/substack";
import { mergeWriting } from "@/lib/writing";
import { readProjects } from "@/lib/projects";
import { readShots } from "@/lib/dribbble";
import Hero from "@/components/Hero";
import CarlDemo from "@/components/CarlDemo";
import MahtaDemo from "@/components/MahtaDemo";
import DribbbleGallery from "@/components/DribbbleGallery";
import type { Project } from "@/lib/types";

export const revalidate = 0;

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "Shipped",
  wip: "In progress",
  archived: "Archive",
};

// Project slugs that render as a featured row with an interactive demo.
const DEMOS: Record<string, () => React.ReactNode> = {
  carl: () => <CarlDemo />,
  mahta: () => <MahtaDemo />,
};

export default async function Home() {
  const [projects, medium, substack, shots] = await Promise.all([
    readProjects(),
    fetchMedium(),
    fetchSubstack(),
    readShots(),
  ]);
  const recentWriting = mergeWriting(medium, substack).slice(0, 5);
  const featuredShots = shots.slice(0, 6);

  return (
    <>
      <Hero />

      {/* ABOUT */}
      <Section id="about" eyebrow="About">
        <div className="max-w-[60ch] space-y-5 text-[17px] md:text-[19px] leading-relaxed text-(--color-bio)">
          <p>
            I&rsquo;m a product manager in climate tech, currently at{" "}
            <span className="text-(--color-ink)">Xpansiv</span> &mdash; before
            that, <span className="text-(--color-ink)">Spotify</span> and{" "}
            <span className="text-(--color-ink)">Staples</span>. I care about
            products that hold up under real constraints, where customer needs,
            business goals, and technical reality each get a seat at the table.
          </p>
          <p>
            My working principle is simple: every meaningful decision needs
            multiple stakeholders, each bringing their own expertise. The
            product manager&rsquo;s job is to make sure none of those voices gets
            lost on the way to a decision.
          </p>
          <p>
            Outside of shipping, I build agents I actually use day to day, and I
            treat this site as a working log of that craft.
          </p>
        </div>
      </Section>

      {/* WORK */}
      <Section id="work" eyebrow="Selected work">
        <div className="divide-y divide-(--color-border)">
          {projects.map((p) => {
            const href = p.links?.[0]?.url;
            const external = href?.startsWith("http");
            const year = p.date?.slice(0, 4);
            const meta = `${STATUS_LABEL[p.status]}${year ? ` · ${year}` : ""}`;

            // ---- Featured rows: a copy column + an interactive demo. ----
            // Carl renders copy-left / demo-right; Mahta swaps sides via the
            // `.work-item--mahta .mahta-demo { order: -1 }` rule in globals.css.
            const Demo = DEMOS[p.slug];
            if (Demo) {
              return (
                <div key={p.slug} className="py-11 first:pt-0">
                  <div
                    className={`work-item--featured${
                      p.slug === "mahta" ? " work-item--mahta" : ""
                    }`}
                  >
                    <div className="work-copy">
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--color-muted)">
                        {meta}
                      </span>
                      <h3 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-(--color-ink)">
                        {p.title}
                      </h3>
                      <p className="work-desc text-[15px] md:text-[16px] leading-relaxed text-(--color-bio)">
                        {p.description}
                      </p>
                    </div>
                    {Demo()}
                  </div>
                </div>
              );
            }

            // ---- Standard rows (no demo). ----
            const Inner = (
              <div className="group flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--color-muted)">
                  {meta}
                </span>
                <h3 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-(--color-ink) flex items-center gap-2">
                  {p.title}
                  {href && (
                    <span className="text-(--color-muted) group-hover:text-(--color-accent) transition text-[16px]">
                      ↗
                    </span>
                  )}
                </h3>
                <p className="text-[15px] md:text-[16px] leading-relaxed text-(--color-bio) max-w-[62ch]">
                  {p.description}
                </p>
              </div>
            );
            return href ? (
              <a
                key={p.slug}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener" : undefined}
                className="block no-underline py-11 first:pt-0"
              >
                {Inner}
              </a>
            ) : (
              <div key={p.slug} className="py-11 first:pt-0">{Inner}</div>
            );
          })}
        </div>
      </Section>

      {/* WRITING */}
      <Section id="writing" eyebrow="Writing">
        {recentWriting.length === 0 ? (
          <p className="text-(--color-muted)">No posts available right now.</p>
        ) : (
          <ul className="divide-y divide-(--color-border) border-t border-(--color-border)">
            {recentWriting.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener"
                  className="group py-5 flex items-baseline justify-between gap-6 no-underline"
                >
                  <span className="text-[16px] md:text-[18px] text-(--color-ink) group-hover:text-(--color-accent) transition leading-snug">
                    {item.title}
                  </span>
                  <time
                    dateTime={item.timestamp}
                    className="font-mono text-[12px] text-(--color-muted) tabular-nums whitespace-nowrap"
                  >
                    {item.timestamp.slice(0, 10)}
                  </time>
                </a>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-7">
          <Link
            href="/writing"
            className="font-mono text-[12px] uppercase tracking-[0.14em] text-(--color-muted) hover:text-(--color-ink) transition no-underline"
          >
            All writing →
          </Link>
        </div>
      </Section>

      {/* DESIGN */}
      {featuredShots.length > 0 && (
        <Section id="design" eyebrow="Design Exploration">
          <DribbbleGallery shots={featuredShots} />
          <div className="mt-9">
            <Link
              href="/design"
              className="font-mono text-[12px] uppercase tracking-[0.14em] text-(--color-muted) hover:text-(--color-ink) transition no-underline"
            >
              All design exploration →
            </Link>
          </div>
        </Section>
      )}

      <Footer />
    </>
  );
}

function Section({
  id,
  eyebrow,
  children,
}: {
  id: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 border-t border-(--color-border) py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1100px] px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--color-muted) mb-6">
          {eyebrow}
        </p>
        {children}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-(--color-border) py-16">
      <div className="mx-auto max-w-[1100px] px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <p className="text-[22px] md:text-[28px] font-semibold tracking-tight text-(--color-ink) max-w-[20ch]">
            Let&rsquo;s build something that holds up.
          </p>
        </div>
        <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-(--color-muted) flex gap-5">
          <a href="https://www.linkedin.com/in/jerico-lumanlan" target="_blank" rel="noopener" className="hover:text-(--color-ink) transition no-underline">LinkedIn</a>
          <a href="https://x.com/jericolumanlan" target="_blank" rel="noopener" className="hover:text-(--color-ink) transition no-underline">X</a>
          <a href="https://jericolumanlan.medium.com" target="_blank" rel="noopener" className="hover:text-(--color-ink) transition no-underline">Medium</a>
        </div>
      </div>
    </footer>
  );
}
