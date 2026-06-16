import { fetchMedium } from "@/lib/medium";
import { fetchSubstack } from "@/lib/substack";
import { fetchGitHubEvents } from "@/lib/githubEvents";
import { mergeWriting } from "@/lib/writing";
import { buildTickerItems } from "@/lib/ticker";
import Hero from "@/components/Hero";
import ActivityTicker from "@/components/ActivityTicker";
import CarlDemo from "@/components/CarlDemo";
import MahtaDemo from "@/components/MahtaDemo";
import RevealController from "@/components/RevealController";
import SectionIndex from "@/components/SectionIndex";

export const revalidate = 0;

export const metadata = {
  alternates: { canonical: "/" },
};

// Person entity for branded search — helps Google connect jericolumanlan.com to
// the off-site profiles (sameAs) and build a knowledge entity for the name.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jerico Lumanlan",
  url: "https://jericolumanlan.com",
  jobTitle: "Product Manager",
  worksFor: { "@type": "Organization", name: "Xpansiv" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Boston",
    addressRegion: "MA",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.linkedin.com/in/jerico-lumanlan",
    "https://x.com/jericolumanlan",
    "https://jericolumanlan.medium.com",
    "https://github.com/lumanlanj",
  ],
};

export default async function Home() {
  const [medium, substack, ghEvents] = await Promise.all([
    fetchMedium(),
    fetchSubstack(),
    fetchGitHubEvents(),
  ]);
  const recentWriting = mergeWriting(medium, substack).slice(0, 5);

  // Activity ticker — live GitHub events + posts from the last 7 days, newest-first.
  const tickerItems = buildTickerItems(recentWriting, ghEvents);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <ActivityTicker items={tickerItems} />
      <SectionIndex />
      {/* HERO — identity + impact (merges About bio + Proof stats), anchored #about */}
      <Hero />

      {/* THE LAB */}
      <section className="block" id="lab">
        <div className="container">
          <p className="eyebrow reveal"><span className="num">02</span><span className="rule" aria-hidden="true"></span><span>The Lab</span></p>
          <p className="section-lede reveal">Agents and tools I build for myself and actually use day to day &mdash; where I keep my craft sharp and test what AI products should feel like.</p>
          <div className="work-list">
            <div>
              <div className="work-item work-item--featured">
                <div className="work-copy reveal">
                  <span className="work-status"><span className="ws-dot ws-live" aria-hidden="true"></span>Shipped · 2026</span>
                  <h3 className="work-title">Carl</h3>
                  <p className="work-desc">The assistant I actually rely on. Carl lives in my iMessage, runs on a Mac Mini, and keeps a persistent memory that learns my preferences and remembers my projects — so he works the way I would, and gets better the more we talk. 85 MCP tools wire him into Gmail, Calendar, GitHub, Drive, and Sheets; text him a screenshot and he takes it from there.</p>
                  <ul className="work-highlights">
                    <li>Knows how I work — learns my preferences and corrections, and remembers them across conversations</li>
                    <li>Triages my Gmail and runs nightly digests on the AI and climate-tech industries</li>
                    <li>Turns a texted screenshot into a calendar event, a task, or a draft</li>
                    <li>Spins up throwaway mini-apps from a plain conversation</li>
                    <li>Production-grade for an agent: self-heals when it crashes and pings me on Telegram if anything&rsquo;s down</li>
                  </ul>
                </div>
                <CarlDemo />
              </div>
            </div>
            <div>
              <div className="work-item work-item--featured work-item--mahta">
                <div className="work-copy reveal">
                  <span className="work-status"><span className="ws-dot ws-prog" aria-hidden="true"></span>In progress · 2026</span>
                  <h3 className="work-title">Mahta</h3>
                  <p className="work-desc">An AI product analyst. Name a company and a flow — say, Amazon&rsquo;s Subscribe &amp; Save enrollment — and Mahta researches the program, drives a real browser through the experience step by step, and returns a two-layer report: a Market &amp; Strategy brief, then an annotated storyboard of the real journey with every point of friction, persuasion, and gating flagged on the exact screen where it happens. Hours of competitive teardown, in minutes.</p>
                  <a className="work-cta" href="https://mahta.space" target="_blank" rel="noopener">Visit Mahta <span className="cta-arrow" aria-hidden="true">↗</span></a>
                </div>
                <MahtaDemo />
              </div>
            </div>
          </div>

          {/* GitHub — tinkering in public */}
          <div className="tinker reveal">
            <div className="tinker-glyph">
              <svg className="gh" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </div>
            <div>
              <span className="tinker-eyebrow"><span className="ws-dot" aria-hidden="true"></span>Tinkering in public</span>
              <h3 className="tinker-h">I tinker. Here&rsquo;s the workbench.</h3>
              <p className="tinker-p">Rough experiments, half-finished tools, and the occasional thing that actually works &mdash; all out in the open. If you want to see how I think by what I make, it&rsquo;s here.</p>
            </div>
            <a className="work-cta" href="https://github.com/lumanlanj" target="_blank" rel="noopener">View GitHub <span className="cta-arrow" aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      {/* WRITING */}
      <section className="block" id="writing">
        <div className="container">
          <p className="eyebrow reveal"><span className="num">03</span><span className="rule" aria-hidden="true"></span><span>Writing</span></p>
          {recentWriting.length === 0 ? (
            <p className="section-lede">No posts available right now.</p>
          ) : (
            <ul className="writing-list">
              {recentWriting.map((item) => (
                <li key={item.id} className="reveal">
                  <a href={item.url} target="_blank" rel="noopener">
                    <span className="writing-title">{item.title}</span>
                    <time className="writing-date" dateTime={item.timestamp}>
                      {item.timestamp.slice(0, 10)}
                    </time>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <a className="all-writing reveal" href="/writing">All writing →</a>
        </div>
      </section>

      {/* CONTACT / FOOTER */}
      <footer className="site-footer" id="contact">
        <div className="container">
          <p className="eyebrow reveal"><span className="num">04</span><span className="rule" aria-hidden="true"></span><span>Contact</span></p>
          <div className="contact-grid">
            <div className="contact-lead reveal">
              <p className="footer-cta">Let&rsquo;s build something that holds up.</p>
              <div className="contact-actions">
                <a className="contact-btn" href="/Jerico-Lumanlan-Resume.pdf" download="Jerico Lumanlan Resume.pdf">Download résumé <span aria-hidden="true">↓</span></a>
                <a className="contact-btn ghost" href="https://www.linkedin.com/in/jerico-lumanlan" target="_blank" rel="noopener">Connect on LinkedIn <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <div className="contact-note reveal">
              <p>The résumé has the full history, and LinkedIn is the fastest way to reach me.</p>
              <p className="contact-loc mono">Boston, Massachusetts</p>
            </div>
          </div>
          <div className="footer-bottom reveal">
            <span className="fb-name mono">Jerico Lumanlan · © 2026</span>
            <div className="footer-links">
              <a href="https://www.linkedin.com/in/jerico-lumanlan" target="_blank" rel="noopener">LinkedIn</a>
              <a href="https://x.com/jericolumanlan" target="_blank" rel="noopener">X</a>
              <a href="https://jericolumanlan.medium.com" target="_blank" rel="noopener">Medium</a>
            </div>
          </div>
        </div>
      </footer>

      <RevealController />
    </>
  );
}
