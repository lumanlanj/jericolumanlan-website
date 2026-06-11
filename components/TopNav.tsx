"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@vercel/analytics";
import { trackEvent } from "@/lib/track";

// Fire the resume-download conversion to all three analytics sinks: Vercel Web
// Analytics, Microsoft Clarity, and our own first-party endpoint (the one the
// SiteBar menu bar reads for an exact, real-time download count).
function trackResumeDownload() {
  track("resume_download");
  (
    window as typeof window & { clarity?: (...args: unknown[]) => void }
  ).clarity?.("event", "resume_download");
  trackEvent("resume_download");
}

const TABS = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "lab", label: "Lab" },
  { id: "writing", label: "Writing" },
];

export default function TopNav() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  // Darken the glass pill once scrolled past the hero, and (on the homepage)
  // light the tab whose section is centered in view — scroll-spy.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let io: IntersectionObserver | null = null;
    if (pathname === "/") {
      const links = Array.from(header.querySelectorAll<HTMLElement>("a.navlink[data-spy]"));
      const byId: Record<string, HTMLElement> = {};
      links.forEach((a) => { byId[a.dataset.spy as string] = a; });
      const sections = TABS.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            links.forEach((l) => l.classList.remove("active"));
            byId[en.target.id]?.classList.add("active");
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      sections.forEach((s) => io!.observe(s));
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, [pathname]);

  return (
    <header className="topnav" ref={headerRef}>
      <nav className="navpill" aria-label="Primary">
        <div className="nav-tabs">
          {TABS.map((t) => (
            <Link key={t.id} className="navlink" data-spy={t.id} href={`/#${t.id}`}>
              {t.label}
            </Link>
          ))}
        </div>
        <a
          className="nav-resume"
          href="/Jerico-Lumanlan-Resume.pdf"
          download="Jerico Lumanlan Resume.pdf"
          onClick={trackResumeDownload}
        >
          Résumé ↓
        </a>
      </nav>
    </header>
  );
}
