import IcosahedronCanvas from "@/components/IcosahedronCanvas";

/**
 * Full-viewport landing hero: the 3D icosahedron floats as the centerpiece with
 * a bold, yurikim-style introductory statement anchored bottom-left. A CSS
 * radial gradient is the WebGL fallback (shown if the canvas renders nothing).
 */
export default function Hero() {
  return (
    <section
      className="relative h-svh min-h-[600px] w-full overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(80% 70% at 50% 42%, #0c0814 0%, #050507 55%, #020203 100%)",
      }}
    >
      <IcosahedronCanvas />

      {/* Legibility scrim behind the intro. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.12) 32%, transparent 58%)",
        }}
      />

      {/* Intro statement, bottom-left. */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-auto max-w-[1100px] px-6 pb-16 md:pb-20">
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/55 mb-4">
            Product Manager
          </p>
          <h1 className="text-[34px] leading-[1.08] md:text-[58px] md:leading-[1.04] font-semibold tracking-tight max-w-[16ch]">
            Yo, I&rsquo;m Jerico.
          </h1>
          <p className="mt-4 md:mt-5 text-[16px] md:text-[20px] leading-relaxed text-white/70 max-w-[46ch]">
            I build products across sustainability, ecommerce, and customer
            experience.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px] uppercase tracking-[0.12em] text-white/45">
            <span>Now @ Xpansiv</span>
            <span className="text-white/25">/</span>
            <span>Previously Spotify, Staples</span>
            <span className="text-white/25">/</span>
            <span>Based in Boston</span>
          </div>
        </div>
      </div>

      {/* Scroll cue. */}
      <a
        href="#about"
        aria-label="Scroll to about"
        className="hero-scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 text-white/45 hover:text-white/90 transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
