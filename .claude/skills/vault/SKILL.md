---
name: vault
description: "Obsidian vault — notes, daily entries, search, import, guide. Triggers on '/vault', '/note', '/daily', '/vault-search', '/vault-import', 'create a note', 'daily note', 'add to today', 'journal entry', 'search my vault', 'find notes about', 'import to vault', 'how does my vault work', 'vault help', 'vault guide'."
allowed-tools: mcp__litememory__vault_write, mcp__litememory__vault_read, mcp__litememory__vault_search, mcp__litememory__vault_daily, mcp__litememory__vault_list, mcp__litememory__vault_tags, mcp__litememory__vault_recent, mcp__litememory__vault_link, Read
---

# Obsidian Vault

All-in-one skill for your Obsidian vault at `$VAULT_PATH (configured in LiteCore Settings)`.

Determine which section applies based on the user's intent:
- Creating/updating a named note → **Create/Update Notes**
- Viewing or adding to today's journal → **Daily Notes**
- Finding existing notes → **Search Vault**
- Importing an external file → **Import Files**
- Questions about vault structure/conventions → **Vault Guide**

---

## Create/Update Notes

Create or update a note in the Obsidian vault.

### Vault Structure

| Folder | Purpose | Frontmatter `type` |
|--------|---------|---------------------|
| **Projects/** | Project notes, specs, architecture decisions | `project` |
| **Research/** | Technical research, videos, articles, tutorials | `research` |
| **Ideas/** | Brainstorms, concepts, "what if" notes | `idea` |
| **Chronicles/** | Origin stories, milestones, journey narrative | `chronicle` |
| **Daily/** | Daily journal notes (use Daily Notes section instead) | `daily` |
| **Sessions/** | Auto-captured session summaries (auto-managed) | `session` |

### Known Projects
Detected from vault folder structure

### Steps

1. **Parse arguments from `$ARGUMENTS`**:
   - If it contains a `/`, treat as an explicit path (e.g. `Projects/MyProject`)
   - If it matches or references a project name in the vault -> `Projects/<name>`
   - If it references the current working project (check cwd) -> `Projects/<project>`
   - Otherwise infer folder from keywords:
     - "research", "learn", "study", "article", "video" -> `Research/`
     - "idea", "brainstorm", "what if", "concept" -> `Ideas/`
     - Default -> `Ideas/`

2. **Check if note exists** using vault_read:
   - If exists, read it and **append** the new content under the appropriate section (or ask user if unclear)
   - If not exists, create new from template structure below

3. **Generate frontmatter** (for new notes):
   ```yaml
   ---
   type: <from folder table above>
   title: "<title>"
   created: <current ISO datetime>
   updated: <current ISO datetime>
   status: active
   tags:
     - <type>
     - <additional inferred tags>
   ---
   ```

4. **Generate body**:
   - If user provided content after the title, write it under an appropriate heading
   - If no content, use the skeleton for that note type:
     - **Projects**: `## Overview`, `## Current Status`, `## Key Decisions`, `## Links`
     - **Research**: `## Summary`, `## Notes`, `## Sources`, `## Links`
     - **Ideas**: `## Concept`, `## Details`, `## Links`
   - Use `[[wikilinks]]` to connect to related notes (e.g. `[[ProjectName]]`, `[[Research Topic]]`)

5. **Write note** using vault_write to the determined path

6. **Confirm** with the full path and a brief summary of what was written

---

## Daily Notes

Manage today's daily note in the Obsidian vault.

### Steps

1. **Get/create daily note** by calling vault_daily (auto-creates from template if it doesn't exist)

2. **If no arguments** (`$ARGUMENTS` is empty): Display today's note content formatted nicely

3. **If arguments provided**:
   - Read current daily note content
   - Append entry under the "## Log" heading with timestamp prefix: `- HH:MM — $ARGUMENTS`
   - Write updated content back using vault_write

4. **Show confirmation** of what was added or displayed

---

## Search Vault

Search the vault using text, tags, or link analysis.

### Steps

1. **Parse arguments from `$ARGUMENTS`**:
   - `--tag X` -> use vault_tags to find notes with that tag
   - `--folder X` -> restrict search to that folder
   - `--links-to X` -> use vault_link to find backlinks
   - Plain text -> full-text search via vault_search

2. **Execute search** using the appropriate MCP tool

3. **Display results** in a clean table or list format:
   - Path, title, relevant excerpt, tags
   - Show match context when available

4. **Offer to read**: "Want me to read any of these notes?"

---

## Import Files

Import external markdown files or content into the vault.

### Steps

1. **Read the source file** from `$ARGUMENTS` using the Read tool
   - The first argument is the file path to import

2. **Determine destination**:
   - If `--to` flag provided, use that vault path
   - Otherwise infer from content:
     - Looks like a transcript -> `Research/`
     - Looks like a story/chronicle -> `Chronicles/`
     - Looks like project docs -> `Projects/`
     - Default -> `Research/`

3. **Generate frontmatter**:
   ```yaml
   type: <inferred>
   title: "<extracted from first heading or filename>"
   created: <current ISO datetime>
   imported: <current ISO datetime>
   source: "<original file path>"
   tags: [imported, <inferred>]
   ```

4. **Write to vault** using vault_write with the content and frontmatter

5. **Confirm** with the imported path and word count

---

## Vault Guide

Reference information about how the vault is organized and used.

### Vault Location
`$VAULT_PATH (configured in LiteCore Settings)`

### Folder Structure

| Folder | Purpose |
|--------|---------|
| **Chronicles/** | Origin stories, milestones, the journey narrative |
| **Daily/** | Daily journal notes (YYYY-MM-DD.md format) |
| **Ideas/** | Brainstorms, concepts, "what if" notes |
| **Projects/** | Project notes, specs, architecture decisions |
| **Research/** | Technical research, videos, articles, tutorials |
| **Sessions/** | Auto-captured Claude Code session summaries |
| **System/** | Vault config, internal documentation |
| **Templates/** | Note templates (daily, project, research, idea, session) |

### Key Commands

- `/vault note [title]` — Create or update a note
- `/vault daily [entry]` — Open or add to today's daily note
- `/vault search [query]` — Search the vault by content, tags, or links
- `/vault import [path]` — Import an external file into the vault

### Conventions

#### Frontmatter
Every note should have YAML frontmatter:
```yaml
---
type: project|daily|research|idea|session|chronicle
title: "Note Title"
created: YYYY-MM-DDTHH:mm:ss
updated: YYYY-MM-DDTHH:mm:ss
tags: [tag1, tag2]
---
```

#### Linking
- Use `[[wikilinks]]` to connect notes (e.g. `[[ProjectName]]`, `[[Research Topic]]`)
- Use `#tags` for categorization
- Cross-reference projects with `[[Project Name]]`

#### Templates
Available in Templates/ folder:
- `daily.md` — Daily journal note
- `project.md` — Project documentation
- `research.md` — Research/learning note
- `idea.md` — Brainstorm/concept note
- `session.md` — Session summary

### When to Use the Vault

- **Before starting work**: Search vault for existing context on the topic
- **During work**: Log important decisions to the daily note
- **After work**: Session summaries can be auto-captured via Claude Code hooks
- **When researching**: Save findings to Research/ with proper tags
- **When brainstorming**: Capture ideas in Ideas/ before they're lost
