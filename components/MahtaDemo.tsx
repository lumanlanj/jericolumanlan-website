"use client";

import { useEffect, useRef } from "react";

/**
 * Mahta — animated product-analyst demo. A dark macOS window that cycles through:
 * a target prompt → "Researching" → "Driving browser" (a mini-browser stepping
 * through a competitor flow with friction / persuasion / gating flag pins) →
 * "Report ready" (a Market & Strategy brief + an annotated storyboard).
 * Phase is driven by [data-phase] on the window root. Auto-plays in view, loops,
 * respects prefers-reduced-motion (jumps straight to the finished report).
 *
 * All styling lives in globals.css (".mahta-win / .mq-* / .browser / .storyboard").
 */
type Step = { addr: string; foot: string; top: string; prog: number; flag?: string; type?: string };

const STEPS: Step[] = [
  { addr: "amazon.com/dp/B07… · product",  foot: "Step 1 / 4 · Product page",     top: "44%", prog: 32 },
  { addr: "amazon.com/cart · subscribe offer", foot: "Step 2 / 4 · Subscribe offer", top: "36%", prog: 52, flag: "Save 15%",        type: "flag-persuade" },
  { addr: "amazon.com/subscribe/options",  foot: "Step 3 / 4 · Choose frequency", top: "30%", prog: 72, flag: "Frequency buried", type: "flag-friction" },
  { addr: "amazon.com/checkout/signin",    foot: "Step 4 / 4 · Gated checkout",   top: "50%", prog: 90, flag: "Account required", type: "flag-gate" },
];

export default function MahtaDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const win = rootRef.current;
    if (!win) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const statEl = win.querySelector<HTMLElement>(".mq-stat");
    const progEl = win.querySelector<HTMLElement>(".mq-prog i");
    const addrEl = win.querySelector<HTMLElement>(".b-addr");
    const footEl = win.querySelector<HTMLElement>(".b-foot");
    const flagEl = win.querySelector<HTMLElement>(".bp-flag");
    const topEl = win.querySelector<HTMLElement>(".bp-top");
    const briefs = Array.from(win.querySelectorAll<HTMLElement>(".rep-list [data-rep]"));
    const figs = Array.from(win.querySelectorAll<HTMLElement>(".storyboard [data-fig]"));

    let timers: number[] = [];
    let playing = false;
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const setStat = (t: string) => { if (statEl) statEl.textContent = t; };
    const setProg = (p: number) => { if (progEl) progEl.style.width = p + "%"; };

    const applyStep = (s: Step) => {
      if (addrEl) addrEl.textContent = s.addr;
      if (footEl) footEl.textContent = s.foot;
      if (topEl) topEl.style.width = s.top;
      setProg(s.prog);
      if (!flagEl) return;
      flagEl.classList.remove("show");
      if (s.flag) {
        flagEl.textContent = s.flag;
        flagEl.className = "bp-flag " + s.type;
        void flagEl.offsetWidth; // restart the entrance transition
        flagEl.classList.add("show");
      } else {
        flagEl.className = "bp-flag";
        flagEl.textContent = "";
      }
    };

    const reset = () => {
      win.dataset.phase = "research";
      briefs.forEach((b) => b.classList.remove("show"));
      figs.forEach((f) => f.classList.remove("show"));
      flagEl?.classList.remove("show");
      setProg(8);
    };

    const play = () => {
      clearTimers();
      reset();
      setStat("Researching program…");
      at(1200, () => { win.dataset.phase = "browse"; setStat("Driving browser…"); applyStep(STEPS[0]); });
      at(2150, () => applyStep(STEPS[1]));   // persuasion flag
      at(3100, () => applyStep(STEPS[2]));   // friction flag
      at(4050, () => applyStep(STEPS[3]));   // gating flag
      at(5050, () => { setStat("Compiling report…"); setProg(100); });
      at(5750, () => {
        win.dataset.phase = "report";
        setStat("Report ready");
        briefs.forEach((b, i) => at(i * 260, () => b.classList.add("show")));
        figs.forEach((f, i) => at(1100 + i * 200, () => f.classList.add("show")));
      });
      at(11400, () => { if (playing) play(); });
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
              <div className="browser">
                <div className="b-url">
                  <span className="dots"><i></i><i></i><i></i></span>
                  <span className="b-addr">amazon.com</span>
                </div>
                <div className="b-page">
                  <div className="bp-top"></div>
                  <div className="bp-rows"><span></span><span></span></div>
                  <div className="bp-cta">Subscribe &amp; Save</div>
                  <span className="bp-flag"></span>
                </div>
                <div className="b-foot">Launching browser…</div>
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
