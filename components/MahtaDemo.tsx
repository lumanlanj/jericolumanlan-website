"use client";

import { useEffect, useRef } from "react";

/**
 * Mahta — animated product-analyst demo. A dark macOS window that cycles through:
 * research → a 3D capture deck driving a browser step-by-step through a competitor
 * flow (each screen scanned, flagged for friction / persuasion / gating, then
 * receding into a stack) → a finished report (Market & Strategy brief + annotated
 * storyboard). Phase is driven by [data-phase] on the window root. Auto-plays in
 * view, loops, respects prefers-reduced-motion (jumps to the finished report).
 *
 * All styling lives in globals.css (".mahta-win / .mq-* / .cap-* / .storyboard").
 */
type Cap = { th: string; url: string; cta: string; flag: string; flagClass: string; num: string };

const CARDS: Cap[] = [
  { th: "#ff9900", url: "amazon.com/dp/B07…",      cta: "Subscribe & Save",     flag: "Save 15%",        flagClass: "flag-persuade", num: "01" },
  { th: "#2a6fdb", url: "amazon.com/subscribe",     cta: "Choose frequency",     flag: "Frequency buried", flagClass: "flag-friction", num: "02" },
  { th: "#232329", url: "amazon.com/checkout",      cta: "Sign in to continue",  flag: "Account required", flagClass: "flag-gate",     num: "03" },
  { th: "#1f8a5b", url: "amazon.com/manage/subs",   cta: "Manage subscription",  flag: "Cancel buried",    flagClass: "flag-friction", num: "04" },
];

const CAPS = ["Product page", "Frequency options", "Gated checkout", "Manage subscription"];

export default function MahtaDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const win = rootRef.current;
    if (!win) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const statEl = win.querySelector<HTMLElement>(".mq-stat");
    const progEl = win.querySelector<HTMLElement>(".mq-prog i");
    const cards = Array.from(win.querySelectorAll<HTMLElement>(".cap-card"));
    const briefs = Array.from(win.querySelectorAll<HTMLElement>(".rep-list [data-rep]"));
    const figs = Array.from(win.querySelectorAll<HTMLElement>(".storyboard [data-fig]"));

    let timers: number[] = [];
    let playing = false;
    let active = -1;
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const setStat = (t: string) => { if (statEl) statEl.textContent = t; };
    const setProg = (p: number) => { if (progEl) progEl.style.width = p + "%"; };

    const showCap = (i: number) => {
      active = i;
      setStat("Capturing " + (i + 1) + " / 4 · " + CAPS[i]);
      setProg(24 + i * 19);
      cards.forEach((c, idx) => {
        c.classList.remove("is-active", "is-stacked", "is-upcoming", "capturing");
        const off = active - idx;
        if (idx === active) {
          c.classList.add("is-active");
          c.style.zIndex = "30";
          c.style.setProperty("--off", "0");
          void c.offsetWidth;
          c.classList.add("capturing");
          at(620, () => c.classList.add("captured"));
        } else if (idx < active) {
          c.classList.add("is-stacked", "captured");
          c.style.setProperty("--off", String(off));
          c.style.zIndex = String(29 - off);
        } else {
          c.classList.add("is-upcoming");
          c.style.zIndex = "0";
        }
      });
    };

    const reset = () => {
      win.dataset.phase = "research";
      active = -1;
      cards.forEach((c) => {
        c.classList.remove("is-active", "is-stacked", "capturing", "captured");
        c.classList.add("is-upcoming");
        c.style.zIndex = "0";
      });
      briefs.forEach((b) => b.classList.remove("show"));
      figs.forEach((f) => f.classList.remove("show"));
      setProg(8);
    };

    const play = () => {
      clearTimers();
      reset();
      setStat("Researching program…");
      at(1200, () => { win.dataset.phase = "browse"; setStat("Planning the walkthrough…"); });
      at(1700, () => showCap(0));
      at(2750, () => showCap(1));
      at(3800, () => showCap(2));
      at(4850, () => showCap(3));
      at(6000, () => { setStat("Compiling report…"); setProg(100); });
      at(6700, () => {
        win.dataset.phase = "report";
        setStat("Report ready");
        briefs.forEach((b, i) => at(i * 260, () => b.classList.add("show")));
        figs.forEach((f, i) => at(1100 + i * 200, () => f.classList.add("show")));
      });
      at(12800, () => { if (playing) play(); });
    };

    if (reduce) {
      win.dataset.phase = "report";
      setStat("Report ready");
      setProg(100);
      briefs.forEach((b) => b.classList.add("show"));
      figs.forEach((f) => f.classList.add("show"));
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!playing) { playing = true; play(); }
        } else {
          playing = false;
          clearTimers();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(win);
    return () => { io.disconnect(); clearTimers(); };
  }, []);

  return (
    <div className="mahta-demo">
      <div className="mahta-win" ref={rootRef} data-phase="research">
        <div className="mahta-bar">
          <span className="lights"><i className="l-r"></i><i className="l-y"></i><i className="l-g"></i></span>
          <span className="title">Mahta · Product Analyst</span>
        </div>
        <div className="mahta-body">
          <div className="mq-bar">
            <span className="mq-spark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l1.9 5.7L20 9l-5.4 1.6L12 16l-1.8-5.4L5 9l5.4-1.6L12 2z" />
              </svg>
            </span>
            <span className="mq-target"><b>Amazon</b> — Subscribe &amp; Save enrollment</span>
          </div>

          <div className="mq-status">
            <span className="mq-dot"></span>
            <span className="mq-stat">Researching program…</span>
            <span className="mq-prog"><i></i></span>
          </div>

          <div className="mq-stage">
            <div className="mq-work">
              <div className="cap-scene">
                <div className="cap-deck">
                  {CARDS.map((c) => (
                    <div className="cap-card is-upcoming" key={c.num}>
                      <div className="cap-screen" style={{ ["--th" as string]: c.th }}>
                        <div className="cap-chrome">
                          <span className="cap-dots"><i></i><i></i><i></i></span>
                          <span className="cap-url">{c.url}</span>
                        </div>
                        <div className="cap-page">
                          <div className="cap-hero"></div>
                          <div className="cap-ln a"></div>
                          <div className="cap-ln b"></div>
                          <div className="cap-cta">{c.cta}</div>
                        </div>
                        <div className="cap-scan" aria-hidden="true"></div>
                      </div>
                      <span className={`cap-flag ${c.flagClass}`}>{c.flag}</span>
                      <span className="cap-num mono">{c.num}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mq-report">
              <div className="rep-sec">
                <div className="rep-h">Market &amp; Strategy</div>
                <ul className="rep-list">
                  <li data-rep="1"><span>How it works</span><b>Auto-deliver, 5–15% off</b></li>
                  <li data-rep="2"><span>Mechanics</span><b>Lock-in via tiered discounts</b></li>
                  <li data-rep="3"><span>Sentiment</span><b>Savings loved; edits frustrate</b></li>
                  <li data-rep="4"><span>Latest</span><b>Grocery expansion, 2026</b></li>
                </ul>
              </div>
              <div className="rep-sec">
                <div className="rep-h">Annotated journey</div>
                <div className="storyboard">
                  <figure data-fig="1"><div className="thumb" style={{ ["--th" as string]: "#ff9900" }}></div><figcaption className="flag flag-persuade">Persuasion</figcaption></figure>
                  <figure data-fig="2"><div className="thumb" style={{ ["--th" as string]: "#2a6fdb" }}></div><figcaption className="flag flag-friction">Friction</figcaption></figure>
                  <figure data-fig="3"><div className="thumb" style={{ ["--th" as string]: "#232329" }}></div><figcaption className="flag flag-gate">Gating</figcaption></figure>
                  <figure data-fig="4"><div className="thumb" style={{ ["--th" as string]: "#1f8a5b" }}></div><figcaption className="flag flag-friction">Friction</figcaption></figure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
