---
title: This site
description: Self-updating personal site that aggregates Medium posts, GitHub activity, and a repo-local log into one chronological timeline. Zero LLM authorship in v1.
status: live
order: 2
date: 2026-05-26
links:
  - label: Source
    url: https://github.com/lumanlanj/jericolumanlan-website
---

The site I'm reading on right now. Next.js 14, Vercel, no database. Sources are fetched live on every request: Medium RSS, GitHub GraphQL, repo-local markdown. A source failing silently drops out of the timeline rather than breaking the page.

The premise: I'm already publishing to existing channels. Why maintain a parallel portfolio that copies what's elsewhere? Aggregate them in one place and let them stay current at the source.
