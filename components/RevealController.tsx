"use client";

import { useEffect } from "react";

/**
 * Progressive-enhancement controller for the homepage: reveals `.reveal` blocks
 * on scroll and counts up `[data-count]` figures in the proof band. Mirrors the
 * vanilla design prototype. Content is server-rendered visible (and with final
 * stat values), so no-JS / reduced-motion visitors lose nothing.
 */
export default function RevealController() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const counts = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));

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

    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("in"));
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

    return () => {
      revIo.disconnect();
      countIo?.disconnect();
    };
  }, []);

  return null;
}
