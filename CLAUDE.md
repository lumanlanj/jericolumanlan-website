# jericolumanlan.com — working rules

Personal site. **Next.js 16 · React 19 · Tailwind CSS v4** (CSS-first config in
`app/globals.css`, not `tailwind.config`). Auto-deploys to production on every
push to `main` via Vercel. Some routes pull live data (Medium/Substack/projects)
so prefer server components and keep `revalidate` intentional.

## RULE: every UI change ships mobile + iPad friendly — no exceptions

A visual/layout enhancement is **not done** until it has been implemented *and*
verified to look and work correctly on phone and iPad, not just desktop. This is
part of the change itself, never a follow-up. When you add or modify any
component, page, or style:

1. **Build it responsive in the same pass.** Default to mobile-first (unprefixed
   styles target the smallest screen), then layer up with `sm:` / `md:` / `lg:`.
   Don't write a desktop layout and "make it responsive later."
2. **Verify at these widths before considering it complete** (resize the browser
   or use a device-emulator at each):
   - **375px** — small phone (also sanity-check 320px for no horizontal overflow)
   - **768px** — iPad portrait (this is exactly the `md` breakpoint)
   - **1024px** — iPad landscape (the `lg` breakpoint)
   - **≥1280px** — desktop
   Also check **landscape phone** (short viewport height) for anything full-height.
3. **State in the change description what you verified** at those widths.

### Breakpoints (Tailwind v4 defaults)
`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280. iPad portrait lands on `md`, iPad
landscape on `lg`. Treat 768px as a first-class target, not a desktop afterthought.

### Mobile/iPad invariants — preserve these, they're already established here
- **No horizontal scroll** at 320–430px. Long unbroken strings and fixed-width
  rows are the usual culprits; constrain with `max-w-*` / `min-w-0` / wrapping.
- **Full-height uses `h-svh` + a `min-h-*` fallback** (see `Hero.tsx`) — never
  bare `h-screen`, which breaks with mobile browser chrome.
- **Floating/fixed nav respects safe areas** via `env(safe-area-inset-*)` and the
  layout sets `viewportFit: "cover"` (see `TopNav.tsx`, `app/layout.tsx`). Keep it.
- **Tap targets ≥ ~40px.** Don't shrink interactive padding below usable size on
  touch; scale type/padding down with `sm:` only where it still stays tappable.
- **Touch input is first-class.** Use pointer events (not mouse-only), keep
  `touch-pan-y` on draggable canvas so vertical scroll still works, and provide a
  touch equivalent for any hover/dblclick affordance (see `IcosahedronCanvas.tsx`).
- **Respect `prefers-reduced-motion`** for every animation (there's a block in
  `globals.css` — extend it, don't bypass it).
- **Canvas/WebGL perf on mobile:** cap `devicePixelRatio` at 2 and pause render on
  `visibilitychange`. Already done in `IcosahedronCanvas.tsx`; match it for any new
  heavy visual.

## Before pushing to prod (push = deploy)
1. `npm run build` must pass clean (TypeScript + lint).
2. Responsive verified at the widths above.
3. **Commit author must be** `Jerico Lumanlan <50778090+lumanlanj@users.noreply.github.com>`
   — Vercel blocks the build for any other author. The repo's local git config is
   already set to this; don't override it.
4. Push to `main` → Vercel deploys to production automatically. There's no
   separate "deploy" step, so the diff you push is what goes live.
