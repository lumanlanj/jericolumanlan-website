# jericolumanlan.com

My personal site — a living portfolio of the things I build, plus notes and writing.
Built and maintained as its own small product: live data, a 3D hero, and a
mobile-first design system.

**Live:** https://jericolumanlan.com

## What's here

- **Home** — an animated [three.js](https://threejs.org) hero over a short intro.
- **Projects** — write-ups of what I'm building (Mahta, Carl, and more), sourced
  from Markdown in `content/projects/`.
- **Writing** — my latest posts, pulled live from Medium and Substack via RSS.
- **Log** — a running activity feed, including recent GitHub work via the
  GitHub GraphQL API.
- **Design** — a page documenting the site's own design language.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** — CSS-first config in `app/globals.css` (no `tailwind.config`)
- **three.js** for the 3D hero
- **Content** as Markdown + frontmatter (`gray-matter`, `remark`)
- **Live data** — `rss-parser` (Medium/Substack), `@octokit/graphql` (GitHub),
  `@upstash/redis` for lightweight server state
- **Analytics** — `@vercel/analytics`
- Deployed on **Vercel**, auto-deploying on every push to `main`

## Design principle

Every UI change ships mobile + iPad friendly in the same pass — verified at
375 / 768 / 1024 / 1280px before it's considered done. Full details in `CLAUDE.md`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run og:gen   # regenerate the social preview image
```
