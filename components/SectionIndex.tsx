"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed right-edge section index (01–04), shown ≥1320px. The active item tracks
 * the section centered in view via a shared IntersectionObserver.
 */
const ITEMS = [
  { id: "about", label: "About", num: "01" },
  { id: "lab", label: "Lab", num: "02" },
  { id: "writing", label: "Writing", num: "03" },
  { id: "contact", label: "Contact", num: "04" },
];

export default function SectionIndex() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll<HTMLElement>("a[data-target]"));
    const byId: Record<string, HTMLElement> = {};
    links.forEach((a) => { byId[a.dataset.target as string] = a; });
    const sections = ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((l) => l.classList.remove("active"));
          byId[en.target.id]?.classList.add("active");
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="section-index" aria-label="Section navigation" ref={navRef}>
      {ITEMS.map((i) => (
        <a key={i.id} href={`#${i.id}`} data-target={i.id}>
          <span className="si-label">{i.label}</span>
          <span className="si-num">{i.num}</span>
        </a>
      ))}
    </nav>
  );
}
