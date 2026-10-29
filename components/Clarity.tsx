"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";
import { isOptedOut } from "@/lib/track";

// Microsoft Clarity via @microsoft/clarity. The project id is public (it ships
// in the page source either way), so it's baked in as the default;
// NEXT_PUBLIC_CLARITY_ID can override it without a code change.
const DEFAULT_CLARITY_ID = "x4du7710pc";

export default function ClarityInit() {
  const id = process.env.NEXT_PUBLIC_CLARITY_ID ?? DEFAULT_CLARITY_ID;

  useEffect(() => {
    if (!id) return;
    // Skip for an opted-out (owner) browser — the localStorage flag on /optout.
    try {
      if (isOptedOut()) return;
    } catch {
      /* storage error: still init for normal visitors */
    }
    Clarity.init(id);
  }, [id]);

  return null;
}
