---
name: arch
description: Use when working on LiteAISuite, LiteCore, or litesuite.dev and need to locate the right module, understand IPC channels, or navigate the codebase structure. Triggers on 'arch', 'architecture', 'show architecture', 'where is', 'how does the installer work', 'codebase layout', 'explain the structure', 'what module handles'.
---

# Lite Suite Architecture Reference

## Overview

Quick-lookup index into the architecture docs. Read the index, find the right doc, read just that section.

## Files

- **Index:** `{LiteCore install}/docs/architecture/INDEX.md`
- **Docs directory:** `{LiteCore install}/docs/architecture/`

## Docs

| # | File | Subject |
|---|------|---------|
| 00 | 00-Ecosystem-Overview.md | Suite-wide architecture, app registry, port map, shared patterns |
| 01 | 01-LiteCore.md | Consolidated hub: installer, dashboard, terminal, MCP mgmt, licensing |
| 02 | 02-LiteEditor.md | Code editor: Monaco, canvas/zen modes, agent bridge, MCP server |
| 03 | 03-LiteTerminal.md | Multi-terminal: grid/splitter/tab/window layouts, PTY bridge |
| 04 | 04-LiteSpeak.md | Voice dictation: STT/LLM/TTS pipeline, modes, approval gate |
| 05 | 05-LiteImage.md | Local AI image gen: stable-diffusion.cpp, face swap, training, HF Hub |
| 06 | 06-LiteYT.md | YouTube transcript extraction, channel scraping, analytics |
| 07 | 07-LiteBench.md | LLM benchmarking: FastAPI + React, SSE scoring, test suites |
| 08 | 08-LiteMemory.md | Obsidian vault MCP server: 10 tools, RAG pipeline |
| 09 | 09-litesuite-dev.md | SaaS website: Next.js 15, Cloudflare, Stripe, licensing |

## Workflow

1. Read `INDEX.md` and display the table of contents
2. If the user's question maps to a specific app or topic, read that doc directly
3. Use the Section Lookup table in INDEX.md to map topics to the right document
4. If unclear which section applies, show the index and ask
