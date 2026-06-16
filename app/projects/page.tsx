import { readProjects } from "@/lib/projects";
import Container from "@/components/Container";

export const revalidate = 0;

export const metadata = {
  title: "Projects — Jerico Lumanlan",
  description:
    "Agents and tools Jerico Lumanlan builds and uses day to day, including Carl and Mahta.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await readProjects();

  return (
    <Container>
    <section>
      <header className="mb-6">
        <h1 className="text-[26px] font-bold uppercase tracking-[2.5px] mb-1 text-(--color-ink)">
          Projects
        </h1>
        <div className="text-[12.5px] font-mono text-(--color-muted) tracking-[0.3px]">
          Selected work
        </div>
      </header>
      <hr className="border-(--color-border) mb-9" />

      <div className="flex flex-col gap-8">
        {projects.map((p) => (
          <article key={p.slug}>
            <h2 className="text-[16px] font-semibold text-(--color-ink) mb-1.5 flex items-center gap-2">
              {p.links?.[0] ? (
                <a
                  href={p.links[0].url}
                  target={p.links[0].url.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener"
                  className="no-underline hover:opacity-60 transition flex items-center gap-2"
                >
                  <span className="text-[13px]">↗</span>
                  {p.title}
                </a>
              ) : (
                <span className="flex items-center gap-2">{p.title}</span>
              )}
              {p.status !== "live" && (
                <span className="text-[10px] uppercase tracking-wider text-(--color-muted) font-normal">
                  {p.status}
                </span>
              )}
            </h2>
            <p className="text-[15px] text-(--color-bio) leading-relaxed">{p.description}</p>
          </article>
        ))}
        {projects.length === 0 && (
          <p className="text-(--color-muted)">No projects yet.</p>
        )}
      </div>
    </section>
    </Container>
  );
}
