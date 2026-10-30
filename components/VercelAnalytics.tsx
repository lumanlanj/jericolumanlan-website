"use client";

import { Analytics } from "@vercel/analytics/next";
import { isOptedOut, isOwnerNetwork } from "@/lib/track";

// Vercel Web Analytics, dropped for owner networks (OWNER_IPS → sb_owner
// cookie) and for an opted-out browser via beforeSend — returning null
// cancels the event. Client component because beforeSend is a function prop.
export default function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) =>
        isOwnerNetwork() || isOptedOut() ? null : event
      }
    />
  );
}
