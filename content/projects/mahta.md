---
title: Mahta
description: A voice agent for competitive analysis. Born from hours of manually grinding out market research and wishing the loop was tighter — speak a question, get back a synthesized brief.
status: wip
order: 3
date: 2026-04-23
---

Mahta is an experimental voice agent that takes a research question and returns a structured brief. The pitch is a voice-first interface to the kind of competitive analysis I used to do by hand — pull from Crunchbase, GitHub, Twitter, Substack, then synthesize.

The cloud backend lives on a Mac Mini, the iOS-side wraps it in an Electron app I run locally. Still rough around the edges. Re-architecting on top of the Claude CLI to drop the API-token burn rate.
