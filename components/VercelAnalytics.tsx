"use client";

import { Analytics } from "@vercel/analytics/next";
import { isOptedOut } from "@/lib/track";

// Vercel Web Analytics, but dropped for an opted-out (owner) browser via
// beforeSend — returning null cancels the event. Client component because
// beforeSend is a function prop.
export default function VercelAnalytics() {
  return <Analytics beforeSend={(event) => (isOptedOut() ? null : event)} />;
}
