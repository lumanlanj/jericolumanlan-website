# Design sandbox — handoff rules

Paste this into the Claude design project (as its `CLAUDE.md` / project
instructions) whenever you start a fresh design session. It keeps the design
side matched to the repo's responsive standard (`/CLAUDE.md`).

---

`jerico-site.html` is a **standalone HTML/CSS mock that mirrors the real site**
(Next.js 16 · React 19 · Tailwind v4, repo: lumanlanj/jericolumanlan-website).
Nothing in the design tool writes to disk or git. Changes ship one way: a Claude
Code prompt → Claude Code applies it to the real React/Tailwind components,
builds, and pushes. The mock is for fast visual iteration only.

## RULE: mobile + iPad before handoff — no exceptions

A design iteration is **not ready to hand off** until it has been checked and
looks correct at all of these widths, not just desktop:

- **375px** — small phone (also glance at 320px for no horizontal overflow)
- **768px** — iPad portrait (this is exactly Tailwind's `md` breakpoint)
- **1024px** — iPad landscape (`lg`)
- **≥1280px** — desktop
- **landscape phone** (short height) for anything full-height

Build the mock responsive in the same pass (mobile-first, layer up). Don't design
desktop-only and "make it responsive in the handoff."

## What the handoff prompt MUST include

When translating a change into a Claude Code prompt, always specify the
**responsive behavior per breakpoint**, not just the desktop look — e.g. "stacks
to a single column below `md`," "nav collapses social icons below `sm`," "type
goes 34px → 58px at `md`." Claude Code's `CLAUDE.md` requires verification at
375/768/1024, so give it the intended behavior at each so it implements (not
guesses) it.

## Invariants the real site already follows — mirror them in the mock

- No horizontal scroll at 320–430px.
- Full-height sections use `100svh` (+ a min-height fallback), never `100vh`.
- Floating/fixed nav respects `env(safe-area-inset-*)` (notch / home indicator).
- Tap targets ≥ ~40px on touch.
- Touch-first: any hover/double-click affordance needs a touch equivalent.
- Respect `prefers-reduced-motion` for every animation.
