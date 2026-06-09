"use client";

import { useEffect, useRef } from "react";

/**
 * Carl — animated iMessage thread. A light iPhone showing the user sending Carl
 * a screenshot of a plan, asking it to add a calendar event, Carl "typing", then
 * returning an event card + confirmation. Auto-plays when scrolled into view and
 * loops; respects prefers-reduced-motion (shows the full thread, no animation).
 *
 * All styling lives in globals.css (the ".iphone / .msg / .bubble / .event-card"
 * classes). This component only owns the markup + the timed reveal sequence.
 */
export default function CarlDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const thread = root.querySelector<HTMLElement>(".msg-area");
    if (!thread) return;

    const steps = Array.from(thread.querySelectorAll<HTMLElement>("[data-step]"));
    const typing = thread.querySelector<HTMLElement>(".msg-typing");
    const byStep = (n: number) => steps.find((s) => s.dataset.step === String(n));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timers: number[] = [];
    let playing = false;
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const show = (el?: HTMLElement | null) => el && el.classList.add("show");
    const hide = (el?: HTMLElement | null) => el && el.classList.remove("show");

    const play = () => {
      clearTimers();
      steps.forEach((s) => s.classList.remove("show"));
      at(300, () => show(byStep(1)));                       // screenshot of the plan
      at(1250, () => show(byStep(2)));                      // "add this to my calendar?"
      at(2050, () => show(typing));                         // Carl typing…
      at(3450, () => { hide(typing); show(byStep(4)); });   // "On it"
      at(4250, () => show(byStep(5)));                      // event card
      at(5200, () => show(byStep(6)));                      // "Done"
      at(9200, () => { if (playing) play(); });             // loop
    };

    if (reduce) {
      steps.forEach((s) => s.classList.add("show"));
      hide(typing);
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
      { threshold: 0.35 }
    );
    io.observe(root);
    return () => { io.disconnect(); clearTimers(); };
  }, []);

  return (
    <div className="carl-demo">
      <div className="iphone" ref={rootRef}>
        <div className="iphone-screen">
          <div className="di"></div>

          <div className="status-bar">
            <span className="sb-time">9:41</span>
            <span className="sb-icons">
              <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor" aria-hidden="true">
                <rect x="0" y="7" width="3" height="4" rx="1" />
                <rect x="5" y="5" width="3" height="6" rx="1" />
                <rect x="10" y="2.5" width="3" height="8.5" rx="1" />
                <rect x="15" y="0" width="3" height="11" rx="1" />
              </svg>
              <svg width="16" height="11" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
                <path d="M8 2.5c2.4 0 4.6.9 6.3 2.4l-1.3 1.6A7.4 7.4 0 0 0 8 5.6 7.4 7.4 0 0 0 3 6.5L1.7 4.9A9.4 9.4 0 0 1 8 2.5z" />
                <path d="M8 6.6c1.3 0 2.5.5 3.4 1.3L8 11.5 4.6 7.9A5 5 0 0 1 8 6.6z" />
              </svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
                <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="#000" opacity="0.35" />
                <rect x="2" y="2" width="16" height="8" rx="1.5" fill="#000" />
                <path d="M23 4.2v3.6c.6-.3 1-.9 1-1.8s-.4-1.5-1-1.8z" fill="#000" opacity="0.35" />
              </svg>
            </span>
          </div>

          <div className="msg-header">
            <div className="mh-avatar">C</div>
            <div className="mh-name">
              Carl
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="#bcbcc0" strokeWidth="1.6" aria-hidden="true">
                <path d="M1 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mh-sub">AI Executive Assistant</div>
          </div>

          <div className="msg-area">
            <div className="msg from-me" data-step="1">
              <div className="bubble-img">
                <div className="shot">
                  <div className="shot-hd">Sarah</div>
                  <div className="sb-b sb-them">Coffee Thursday at 3? ☕️</div>
                  <div className="sb-b sb-me">Perfect — see you then!</div>
                </div>
              </div>
            </div>
            <div className="msg from-me" data-step="2">
              <div className="bubble b-me tail">Carl, can you add this to my calendar?</div>
            </div>
            <div className="msg from-them msg-typing" data-step="3">
              <div className="bubble b-them typing"><span></span><span></span><span></span></div>
            </div>
            <div className="msg from-them" data-step="4">
              <div className="bubble b-them">On it 👀</div>
            </div>
            <div className="msg from-them" data-step="5">
              <div className="event-card">
                <div className="ev-top">
                  <div className="ev-cal"><div className="ev-cal-top">JUN</div><div className="ev-cal-day">12</div></div>
                  <div className="ev-meta">
                    <div className="ev-title">Coffee with Sarah</div>
                    <div className="ev-sub">Thu, Jun 12 · 3:00 PM</div>
                  </div>
                </div>
                <div className="ev-foot">✓ Invite sent to Sarah</div>
              </div>
            </div>
            <div className="msg from-them" data-step="6">
              <div className="bubble b-them tail">Done ✅ It&rsquo;s on your calendar.</div>
            </div>
          </div>

          <div className="msg-input">
            <div className="field">iMessage</div>
            <div className="send"></div>
          </div>
          <div className="screen-home"></div>
        </div>
      </div>
    </div>
  );
}
