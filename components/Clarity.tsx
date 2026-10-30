"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";
import { isOptedOut, isOwnerNetwork } from "@/lib/track";

// Microsoft Clarity via @microsoft/clarity. The project id is public (it ships
// in the page source either way), so it's baked in as the default;
// NEXT_PUBLIC_CLARITY_ID can override it without a code change.
const DEFAULT_CLARITY_ID = "z5gls1j21x";

// Never init Clarity for the site owner's networks (OWNER_IPS → sb_owner
// cookie from middleware) or for a browser that flipped /optout. Clarity's
// own Settings → IP blocking only supports IPv4 and is separate; this covers
// IPv6 /64 prefixes and every device on those networks without per-browser setup.
export default function ClarityInit() {
  const id = process.env.NEXT_PUBLIC_CLARITY_ID ?? DEFAULT_CLARITY_ID;

  useEffect(() => {
    if (!id) return;
    if (isOwnerNetwork()) return;
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
