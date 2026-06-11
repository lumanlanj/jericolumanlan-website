// Shared, dependency-free text/label helpers used across feed sources, content
// readers, and analytics. Pure functions only — safe to import from both client
// and server modules.

/** Collapse whitespace, trim, and truncate to maxChars with an ellipsis. */
export function excerpt(text: string | undefined, maxChars = 240): string {
  if (!text) return "";
  const stripped = text.replace(/\s+/g, " ").trim();
  return stripped.length > maxChars ? stripped.slice(0, maxChars - 1) + "…" : stripped;
}

/** Strip HTML tags, then excerpt the remaining text. */
export function excerptFromHtml(html: string | undefined, maxChars = 240): string {
  if (!html) return "";
  return excerpt(html.replace(/<[^>]+>/g, ""), maxChars);
}

/** gray-matter parses YAML dates into Date objects; normalize to YYYY-MM-DD. */
export function normalizeDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

/**
 * Normalize a (possibly client-supplied) source label to a safe, bounded token:
 * lowercase, only [a-z0-9.-], max 32 chars. Anything empty/garbage → "direct".
 */
export function sanitizeSourceLabel(s: string | undefined): string {
  const v = (s ?? "").toLowerCase().replace(/[^a-z0-9.\-]/g, "").slice(0, 32);
  return v || "direct";
}
