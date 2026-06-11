import { fetchMedium } from "@/lib/medium";
import { fetchSubstack } from "@/lib/substack";
import { mergeWriting } from "@/lib/writing";
import Hero from "@/components/Hero";
import CarlDemo from "@/components/CarlDemo";
import MahtaDemo from "@/components/MahtaDemo";
import RevealController from "@/components/RevealController";
import SectionIndex from "@/components/SectionIndex";

export const revalidate = 0;

export default async function Home() {
  const [medium, substack] = await Promise.all([fetchMedium(), fetchSubstack()]);
  const recentWriting = mergeWriting(medium, substack).slice(0, 5);

  // Hero "Latest" strip candidates — the client filters these to the last 7 days.
  const latest = recentWriting.map((w) => ({
    type: "Blog post",
    title: w.title,
    url: w.url,
    date: w.timestamp.slice(0, 10),
  }));

  return (
    <>
      <SectionIndex />
      <Hero latest={latest} />

      {/* PROOF — career impact by the numbers */}
      <section className="proof" aria-label="Career impact by the numbers">
        <div className="container">
          <p className="proof-frame reveal"><span className="rule" aria-hidden="true"></span><span>Impact <span className="accent">&mdash; across climate tech &amp; e-commerce</span></span></p>
          <div className="proof-grid">
            <div className="stat reveal">
              <div className="stat-fig">
                <span data-count="5.8" data-prefix="$" data-suffix="M+" data-decimals="1">$5.8M+</span>
              </div>
              <div className="stat-cap">Incremental revenue generated through experimentation and journey design</div>
            </div>
            <div className="stat reveal">
              <div className="stat-fig">
                <span data-count="1" data-prefix="~$" data-suffix="B" data-decimals="0">~$1B</span>
              </div>
              <div className="stat-cap">Annual digital-commerce revenue influenced</div>
            </div>
            <div className="stat reveal">
              <div className="stat-fig">
                <span data-count="85" data-suffix="%" data-decimals="0">85%</span>
              </div>
              <div className="stat-cap">AI returns-prediction accuracy, lifted from 40%</div>
            </div>
            <div className="stat reveal">
              <div className="stat-fig">
                <span data-count="80" data-prefix="~" data-suffix="%" data-decimals="0">~80%</span>
              </div>
              <div className="stat-cap">Compliance-reporting effort cut for multi-market ops</div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="block" id="about">
        <div className="container">
          <p className="eyebrow reveal"><span className="num">01</span><span className="rule" aria-hidden="true"></span><span>About</span></p>
          <div className="bio reveal">
            <p>I&rsquo;m a product manager in climate tech, currently at <span className="ink">Xpansiv</span> &mdash; before that, <span className="ink">Staples</span> and <span className="ink">Pitney Bowes</span>. I care about products that hold up under real constraints, where customer needs, business goals, and technical reality each get a seat at the table.</p>
            <p>My working principle is simple: every meaningful decision needs multiple stakeholders, each bringing their own expertise. The product manager&rsquo;s job is to make sure none of those voices gets lost on the way to a decision.</p>
            <p>Outside of shipping, I build agents I actually use day to day, and I treat this site as a working log of that craft.</p>
          </div>
        </div>
      </section>

      {/* SELECTED WORK — roles */}
      <section className="block" id="work">
        <div className="container">
          <p className="eyebrow reveal"><span className="num">02</span><span className="rule" aria-hidden="true"></span><span>Selected work</span></p>
          <p className="section-lede reveal">Five years of shipping revenue, AI, and regulatory-compliance products &mdash; for enterprises like REI and Nordstrom and for Staples&rsquo; highest-revenue commerce programs.</p>
          <div className="roles">
            <article className="role reveal">
              <div className="role-label">
                <h3 className="role-co">Xpansiv <span className="role-tag">Blackstone · Goldman Sachs</span></h3>
                <p className="role-title mono">PM, Managed Solutions · Clean Transportation</p>
                <p className="role-dates mono">2025 — Present</p>
              </div>
              <ul className="role-wins">
                <li>Built a bulk-upload tool that cut multi-account EV-charging usage reporting effort <b>~80%</b> — automating the data backbone of environmental-credit generation.</li>
                <li>Led the product&rsquo;s launch into <b>New Mexico</b>, a new state compliance market, unlocking a new revenue stream and expanding the regulatory footprint.</li>
              </ul>
            </article>

            <article className="role reveal">
              <div className="role-label">
                <h3 className="role-co">Staples</h3>
                <p className="role-title mono">PM, Order Management &amp; Subscriptions</p>
                <p className="role-dates mono">2024 — 2025</p>
              </div>
              <ul className="role-wins">
                <li>Owned roadmap and experimentation across AutoRestock, Lists, and Purchase History — Staples&rsquo; highest-revenue digital commerce programs, driving <b>~$1B</b> in annualized revenue.</li>
                <li>Launched and A/B-tested a &ldquo;Buy It Again&rdquo; CTA whose winning variant drove <b>$3.8M</b> in incremental revenue — beating the $4M annual target two quarters early.</li>
              </ul>
            </article>

            <article className="role reveal">
              <div className="role-label">
                <h3 className="role-co">Pitney Bowes</h3>
                <p className="role-title mono">PM, Returns Experience · B2B Enterprise</p>
                <p className="role-dates mono">2021 — 2024</p>
              </div>
              <ul className="role-wins">
                <li>Led the end-to-end launch of an <b>AI/ML-powered Returns Report</b> with data scientists and enterprise clients (REI, Nordstrom) — lifting prediction accuracy from <b>40% to 85%</b>.</li>
                <li>Migrated <b>200+ clients</b> to the Pitney Bowes API — saving $0.5M annually and reducing support tickets <b>70%</b>.</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* THE LAB */}
      <section className="block" id="lab">
        <div className="container">
          <p className="eyebrow reveal"><span className="num">03</span><span className="rule" aria-hidden="true"></span><span>The Lab</span></p>
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
        </div>
      </section>

      {/* WRITING */}
      <section className="block" id="writing">
        <div className="container">
          <p className="eyebrow reveal"><span className="num">04</span><span className="rule" aria-hidden="true"></span><span>Writing</span></p>
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
          <p className="eyebrow reveal"><span className="num">05</span><span className="rule" aria-hidden="true"></span><span>Contact</span></p>
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
