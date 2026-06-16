import { readShots } from "@/lib/dribbble";
import DribbbleGallery from "@/components/DribbbleGallery";
import Container from "@/components/Container";

export const revalidate = 0;

export const metadata = {
  title: "Design Exploration — Jerico Lumanlan",
  description: "Selected design work and explorations.",
  alternates: { canonical: "/design" },
};

export default async function DesignPage() {
  const shots = await readShots();

  return (
    <Container>
      <section>
        <header className="mb-6">
          <h1 className="text-[26px] font-bold uppercase tracking-[2.5px] mb-1 text-(--color-ink)">
            Design Exploration
          </h1>
          <div className="text-[12.5px] font-mono text-(--color-muted) tracking-[0.3px]">
            Selected work &amp; explorations · from{" "}
            <a
              href="https://dribbble.com/jericol"
              target="_blank"
              rel="noopener"
              className="underline hover:text-(--color-ink) transition"
            >
              Dribbble
            </a>
          </div>
        </header>
        <hr className="border-(--color-border) mb-9" />

        <DribbbleGallery shots={shots} />
      </section>
    </Container>
  );
}
