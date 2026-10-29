"use client";

import { track } from "@vercel/analytics";
import { trackEvent } from "@/lib/track";

function trackResumeDownload() {
  track("resume_download");
  (
    window as typeof window & { clarity?: (...args: unknown[]) => void }
  ).clarity?.("event", "resume_download");
  trackEvent("resume_download");
}

/** Primary + secondary hero CTAs (resume download analytics match TopNav). */
export default function HeroCTAs() {
  return (
    <div className="hero-ctas">
      <a
        className="contact-btn"
        href="/Jerico-Lumanlan-Resume.pdf"
        download="Jerico Lumanlan Resume.pdf"
        onClick={trackResumeDownload}
      >
        Download resume <span aria-hidden="true">↓</span>
      </a>
      <a className="contact-btn ghost" href="mailto:jericol.jobs@gmail.com">
        Email me
      </a>
    </div>
  );
}
