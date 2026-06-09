---
title: Carl
description: "A personal assistant that lives in iMessage — 85 MCP tools wired to Gmail, Calendar, GitHub, Drive, and Sheets. Text it a screenshot and it gets the job done."
status: live
order: 1
date: 2026-05-26
---

Carl is a Claude CLI agent that lives on a Mac Mini and answers iMessage. He replies as `carl.assistant@icloud.com`, uses subscription tokens (no API spend), and reaches into Gmail, Calendar, GitHub, and a dozen other services through a proxy I built and now share with him.

He has agent-mode iteration, session continuity, a recovery watcher that self-heals when he crashes, and a heartbeat that nags me on Telegram when the proxy goes down. Most days he just handles email triage and the morning briefing.
