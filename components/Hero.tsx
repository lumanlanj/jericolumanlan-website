import IcosahedronCanvas from "@/components/IcosahedronCanvas";

/**
 * Split hero — identity + impact on the first screen (merges the old About bio
 * and Proof stats band). Left column: name/role, three-paragraph bio, and a
 * Now / Previously / Based spec list. Right column: a credibility panel of four
 * impact stats that count up on load. The signature WebGL orb is dimmed to an
 * ambient background; a CSS radial gradient is the fallback. Anchored at #about
 * (the top-nav "About" link scrolls here). Stacks to a single column — bio
 * first, panel last — below 900px.
 */
export default function Hero() {
  return (
    <section className="hero" id="about">
      <IcosahedronCanvas />

      {/* Legibility scrim over the orb. */}
      <div className="hero-scrim" />

      <div className="hero-wrap">
        <div className="hero-grid">
          <p className="hero-kicker">
            <span className="hero-name">Jerico Lumanlan</span>
            <span className="hero-role">Product Manager · AI · Revenue · Compliance</span>
          </p>

          <div className="hero-id">
            <div className="hero-bio">
              <p>
                I&rsquo;m a product manager at a climate-tech unicorn, <b>Xpansiv</b> &mdash; backed by
                Aramco, Bank of America, and Goldman Sachs. As a former UX designer, I care about
                products that hold up under real constraints &mdash; where customer needs, business
                goals, and technical reality each get a seat at the table.
              </p>
              <p>
                My working principle is simple: every meaningful decision needs multiple stakeholders,
                each bringing their own expertise &mdash; and the product manager&rsquo;s job is to make
                sure none of those voices gets lost on the way to a decision.
              </p>
              <p>
                What excites me about product management is working at both altitudes: strategizing
                at the 10,000-foot level, then dropping in to sweat the pixels &mdash; all while
                bringing real value to the business and building experiences that feel genuinely
                delightful.
              </p>
              <p>
                Outside of shipping, I build agents I actually use day to day, and I treat this site
                as a working log of that craft. Off the clock, I&rsquo;m a beginner runner and get
                into Olympic-style weightlifting here and there.
              </p>
            </div>
          </div>

          <div className="hero-aside">
            <dl className="hero-meta">
              <div className="hm-cell">
                <dt>Now</dt>
                <dd>Xpansiv — PM, Managed Solutions (Clean Transportation)</dd>
              </div>
              <div className="hm-cell">
                <dt>Previously</dt>
                <dd>Staples · Spotify · Pitney Bowes</dd>
              </div>
              <div className="hm-cell">
                <dt>Based</dt>
                <dd>Boston, Massachusetts</dd>
              </div>
            </dl>

            <aside className="hero-cred" aria-label="Career impact by the numbers">
            <p className="cred-head">
              <span className="rule" aria-hidden="true" />
              <span>
                Impact <span className="accent">&mdash; climate tech &amp; e-commerce</span>
              </span>
            </p>
            <div className="cred-stat">
              <span className="cs-fig">
                <span data-count="5.8" data-prefix="$" data-suffix="M+" data-decimals="1">$5.8M+</span>
              </span>
              <span className="cs-cap">Incremental revenue generated through experimentation &amp; journey design</span>
            </div>
            <div className="cred-stat">
              <span className="cs-fig">
                <span data-count="1" data-prefix="~$" data-suffix="B" data-decimals="0">~$1B</span>
              </span>
              <span className="cs-cap">Annual digital-commerce revenue influenced</span>
            </div>
            <div className="cred-stat">
              <span className="cs-fig">
                <span data-count="85" data-suffix="%" data-decimals="0">85%</span>
              </span>
              <span className="cs-cap">AI returns-prediction accuracy, lifted from 40%</span>
            </div>
            <div className="cred-stat">
              <span className="cs-fig">
                <span data-count="80" data-prefix="~" data-suffix="%" data-decimals="0">~80%</span>
              </span>
              <span className="cs-cap">Compliance-reporting effort cut for multi-market ops</span>
            </div>
          </aside>
          </div>
        </div>
      </div>

      {/* Scroll cue — anchors to the next section. */}
      <a href="#writing" aria-label="Scroll to writing" className="hero-scroll-cue">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
