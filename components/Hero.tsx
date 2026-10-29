import IcosahedronCanvas from "@/components/IcosahedronCanvas";
import HeroCTAs from "@/components/HeroCTAs";

/**
 * Recruiter-facing hero: headline (desktop + mobile), subline, and CTAs over the
 * ambient WebGL orb. Impact stats live in the strip immediately below this
 * section. Scroll cue points at About.
 */
export default function Hero() {
  return (
    <section className="hero" id="hero" aria-label="Introduction">
      <IcosahedronCanvas />

      <div className="hero-scrim" />

      <div className="hero-wrap">
        <div className="hero-intro">
          <p className="hero-kicker">
            <span className="hero-name">Jerico Lumanlan</span>
          </p>

          <h1 className="hero-headline">
            <span className="hero-headline-desktop">
              Senior Product Manager who turns customer insight into revenue — and builds the AI agents he uses every day.
            </span>
            <span className="hero-headline-mobile">
              Senior PM. Builder of AI agents. Climate tech, e-commerce, and AI.
            </span>
          </h1>

          <p className="hero-subline">
            PM at Xpansiv, a climate-tech unicorn backed by Aramco, Bank of America, and Goldman Sachs · ex-Staples (~$1B e-commerce) · former UX designer · Boston
          </p>

          <HeroCTAs />
        </div>
      </div>

      <a href="#about" aria-label="Scroll to about" className="hero-scroll-cue">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
