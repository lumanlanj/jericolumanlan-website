"use client";

import { useEffect, useState } from "react";
import { isOptedOut, setOptedOut } from "@/lib/track";

// Owner analytics opt-out. Visit /optout on any browser you edit from and turn
// it on — that browser is then excluded from first-party counts, Clarity, and
// Vercel. The setting lives in localStorage, so do it once per browser/device.
export default function OptOut() {
  const [out, setOut] = useState<boolean | null>(null);

  useEffect(() => setOut(isOptedOut()), []);

  function toggle(next: boolean) {
    setOptedOut(next);
    setOut(next);
  }

  return (
    <main className="min-h-svh flex items-center justify-center px-6">
      <div className="w-full max-w-md flex flex-col gap-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">
          Analytics opt-out
        </h1>
        <p className="text-[15px] leading-relaxed text-(--color-bio)">
          Excludes <em>this browser</em> from all site analytics — first-party
          counts, Clarity, and Vercel. Set it once on every browser/device you
          edit from; it persists until you clear site data.
        </p>

        {out === null ? (
          <p className="text-(--color-muted) text-sm">Checking…</p>
        ) : (
          <>
            <div
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                out
                  ? "border-(--color-border) bg-white/[0.04] text-(--color-ink)"
                  : "border-(--color-border) text-(--color-muted)"
              }`}
            >
              {out
                ? "✓ You are excluded from analytics on this browser."
                : "You are currently counted in analytics on this browser."}
            </div>
            <button
              onClick={() => toggle(!out)}
              className="self-center rounded-full px-5 py-2.5 text-[14px] font-medium
                         border border-(--color-border) text-(--color-ink)
                         hover:bg-white/[0.08] transition"
            >
              {out ? "Start counting me again" : "Exclude me from analytics"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
