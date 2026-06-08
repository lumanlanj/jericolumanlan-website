---
title: Mahta
description: A macOS desktop voice companion for UX competitive audits. It watches your screen while you browse a competitor, listens to your commentary, and helps you reason about the experience out loud — say "Hey Mahta," and it captures what you're looking at and talks through the UX with you.
status: wip
order: 3
date: 2026-06-07
---

Mahta turns a competitive UX audit into a conversation. You declare who you're looking at — "Hey Mahta, I'm looking at [competitor]" — then browse their product while Mahta quietly captures what's on screen. Ask "what do you see?" and it analyzes the screenshot and walks through the UX with you. It stays silent until invoked, keeps a session history per competitor, and holds context across a research session.

It's a voice-first Electron desktop app with screen-vision analysis. I rebuilt the backend on top of the Claude subscription CLI to drop the per-call API burn rate. Still rough around the edges, but it already replaces the screenshot-and-notes grind I used to do by hand.
