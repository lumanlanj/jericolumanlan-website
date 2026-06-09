---
title: Carl
description: "The assistant I actually rely on. Carl lives in my iMessage, runs on a Mac Mini, and keeps a persistent memory that learns my preferences and remembers my projects — so he works the way I would, and gets better the more we talk. 85 MCP tools wire him into Gmail, Calendar, GitHub, Drive, and Sheets; text him a screenshot and he takes it from there."
highlights:
  - "Knows how I work — learns my preferences and corrections, and remembers them across conversations"
  - "Triages my Gmail and runs nightly digests on the AI and climate-tech industries"
  - "Turns a texted screenshot into a calendar event, a task, or a draft"
  - "Spins up throwaway mini-apps from a plain conversation"
  - "Production-grade for an agent: self-heals when it crashes and pings me on Telegram if anything's down"
status: live
order: 1
date: 2026-05-26
---

Carl is a Claude CLI agent that lives on a Mac Mini and answers iMessage. He replies as `carl.assistant@icloud.com`, uses subscription tokens (no API spend), and reaches into Gmail, Calendar, GitHub, and a dozen other services through a proxy I built and now share with him.

He has agent-mode iteration, session continuity, a recovery watcher that self-heals when he crashes, and a heartbeat that nags me on Telegram when the proxy goes down. Most days he just handles email triage and the morning briefing.
