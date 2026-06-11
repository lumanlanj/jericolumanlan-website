"use client";

import { useEffect, useRef, useState } from "react";
import IcosahedronCanvas from "@/components/IcosahedronCanvas";

/**
 * Full-viewport landing hero: the particle orb morphs through the three domains
 * Jerico works across (Climate → Commerce → AI), with a technical-drawing
 * callout that tracks the active shape. Intro copy + a bordered stat block are
 * pinned bottom-left. A CSS radial gradient is the WebGL fallback.
 */
const DOMAINS = [
  { fig: "01", name: "Climate", desc: "Environmental markets & compliance" },
  { fig: "02", name: "Commerce", desc: "Marketplaces & subscriptions" },
  { fig: "03", name: "AI", desc: "Agents & ML products" },
] as const;

export default function Hero() {
  const [domain, setDomain] = useState(0);
  const hintRef = useRef<HTMLDivElement>(null);
  const d = DOMAINS[domain];

  // One-shot interaction hint: slides in ~1.2s after load, then leaves.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => hintRef.current?.classList.add("is-playing"), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero">
      <IcosahedronCanvas onDomainChange={setDomain} />

      {/* Orb interaction hint — slides down from under the nav, holds, then leaves once. */}
      <div className="orb-hint" ref={hintRef} aria-hidden="true">
        <span className="orb-hint-hand">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0-2-2 2 2 0 0 0-2 2v0a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
            <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8a8 8 0 0 0 8 8h2a8 8 0 0 0 8-8v-1a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
          </svg>
        </span>
        <span>Drag to rotate</span>
        <span className="orb-hint-dot" />
        <span>Double-click to shift</span>
      </div>

      {/* Legibility scrim behind the intro. */}
      <div className="hero-scrim" />

      {/* Orb domain callout — technical-drawing annotation, tracks the orb. */}
      <figure className="orb-callout is-in" aria-hidden="true">
        <span className="oc-rule" />
        <span className="oc-fig">FIG · {d.fig} / 03</span>
        {/* Keyed by domain so the rise animation replays on every morph. */}
        <span className="oc-name" key={`n${domain}`}>{d.name}</span>
        <span className="oc-desc" key={`d${domain}`}>{d.desc}</span>
      </figure>

      {/* Intro statement, bottom-left. */}
      <div className="hero-intro">
        <div className="wrap">
          {/* Identity lockup: name as a confident display line, role in mono beneath. */}
          <div className="hero-name">
            <p className="hn-name">Jerico Lumanlan</p>
            <p className="hn-role">Product Manager</p>
          </div>
          <h1>Building products that hold up under real constraints.</h1>
          <p className="lede">
            I build AI-enabled, revenue-generating, and compliance-driven products across climate
            tech and e-commerce &mdash; shipping work that has influenced{" "}
            <span className="lede-ink">~$1B in annual revenue</span>.
          </p>
          <dl className="hero-meta">
            <div className="hm-cell">
              <dt>Now</dt>
              <dd>Xpansiv — PM, Managed Solutions (Clean Transportation)</dd>
            </div>
            <div className="hm-cell">
              <dt>Previously</dt>
              <dd>Staples · Pitney Bowes</dd>
            </div>
            <div className="hm-cell">
              <dt>Based</dt>
              <dd>Boston, Massachusetts</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Scroll cue. */}
      <a href="#about" aria-label="Scroll to about" className="hero-scroll-cue">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
