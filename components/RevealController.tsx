"use client";

import { useEffect } from "react";

/**
 * Progressive-enhancement controller for the homepage: reveals `.reveal` blocks
 * on scroll, counts up `[data-count]` figures in the impact panel, and runs the
 * "mono decode" scramble on the hero spec-list labels (`.hero-meta[data-decode]`
 * → the Now/Previously/Based `<dt>`s). Mirrors the vanilla design prototype.
 * Content is server-rendered visible (and with final stat/label values), so
 * no-JS / reduced-motion visitors lose nothing.
 */
export default function RevealController() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const counts = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const decodeList = document.querySelector<HTMLDListElement>(".hero-meta[data-decode]");

    const animateCount = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count || "0");
      const dec = parseInt(el.dataset.decimals || "0", 10);
      const pre = el.dataset.prefix || "";
      const suf = el.dataset.suffix || "";
      const dur = 1500;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        el.textContent = pre + (target * e).toFixed(dec) + suf;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = pre + target.toFixed(dec) + suf;
      };
      requestAnimationFrame(step);
    };

    // Mono decode: scramble each label through random chars, settling left→right.
    // The first floor(frame/total * len) chars are real; the rest are random
    // glyphs wrapped in .scram (blue tint). Spaces always render as spaces.
    const DECODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—#@%";
    const intervals: number[] = [];
    const timeouts: number[] = [];
    const decode = (dt: HTMLElement, order: number) => {
      const final = dt.dataset.final ?? (dt.dataset.final = dt.textContent ?? "");
      const len = final.length;
      const total = 16 + order * 4; // later rows take slightly longer
      let frame = 0;
      dt.style.opacity = "1";
      const iv = window.setInterval(() => {
        frame++;
        const settled = Math.floor((frame / total) * len);
        let out = "";
        for (let c = 0; c < len; c++) {
          const ch = final[c];
          if (c < settled || ch === " ") out += ch;
          else out += '<span class="scram">' + DECODE_CHARS[(Math.random() * DECODE_CHARS.length) | 0] + "</span>";
        }
        dt.innerHTML = out;
        if (frame >= total) {
          clearInterval(iv);
          dt.textContent = final; // clean final state, no stray spans
        }
      }, 45);
      intervals.push(iv);
    };
    const runDecode = () => {
      if (!decodeList) return;
      decodeList.classList.add("decoded");
      // Stagger rows; the leading 220ms lets the count-up read first.
      Array.from(decodeList.querySelectorAll<HTMLElement>("dt")).forEach((dt, i) => {
        timeouts.push(window.setTimeout(() => decode(dt, i), 220 + i * 130));
      });
    };

    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("in"));
      decodeList?.classList.add("decoded"); // show labels at full opacity, no scramble
      return;
    }

    const revIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          revIo.unobserve(en.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => revIo.observe(el));

    let countIo: IntersectionObserver | null = null;
    if (counts.length) {
      countIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            animateCount(en.target as HTMLElement);
            countIo!.unobserve(en.target);
          });
        },
        { threshold: 0.6 }
      );
      counts.forEach((el) => countIo!.observe(el));
    }

    let decodeIo: IntersectionObserver | null = null;
    if (decodeList) {
      decodeIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            runDecode();
            decodeIo!.unobserve(en.target);
          });
        },
        { threshold: 0.5 }
      );
      decodeIo.observe(decodeList);
    }

    return () => {
      revIo.disconnect();
      countIo?.disconnect();
      decodeIo?.disconnect();
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return null;
}
