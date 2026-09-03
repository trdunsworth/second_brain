---
title: "Session Notes - OpenCode & Ollama Integration"
tags: ["session-notes", "opencode", "ollama", "mcp", "cross-platform"]
date: 2026-09-03
created: 2026-09-03
creator: "Tony Dunsworth"
---

# Session Notes - OpenCode & Ollama Integration

---

## What Was Done

### 1. Ad-Hoc Query Template (Templater)

Created a Templater-compliant template for tracking ad-hoc data requests.

| File | Location |
|------|----------|
| Base template | `Templates\ad_hoc_query_template.md` |
| Templater version | `Templates\scripts\ad_hoc_query_template_templater.md` |

**Sections:**
- Request Information (query name, date, requestor)
- What Was Requested
- What Was Accessed (system/database/table)
- SQL Statement
- Results (table + outcome summary)
- Analysis Information
- Follow-Up Required (due date + reason)

**Note:** Conditional follow-up section was simplified to static placeholders due to Templater async issues with `tp.system.prompt()` and `if/else` blocks.

---

### 2. PDF Export Script (Fixed)

Fixed the PDF export script that was stripping tables from rendered output.

| File | Location |
|------|----------|
| PowerShell | `Scripts\Export-NoteToPDF.ps1` |

**Bug fix:** The YAML frontmatter stripping regex was eating table content. Changed from regex-based approach to line-by-line `---` boundary detection.

**Usage:**
```powershell
.\Scripts\Export-NoteToPDF.ps1 -InputFile "ALX_Notes\Ad Hoc Statistics\your-file.md"
```

**Tested with:** Busiest Hour and Answer Percentage August 2026 — tables now render correctly in PDF.

---

### 3. OpenCode + Ollama Cross-Platform Integration

Set up unified configuration that syncs across Windows, macOS, and Linux.

#### Files Created

| File | Purpose |
|------|---------|
| `opencode.jsonc` (vault root) | MCP servers config — git-syncs across all 3 OSes |
| `Scripts\ollama-models.json` | Model list (user-editable) |
| `Scripts\Ollama-Status.ps1` | PowerShell status check |
| `Scripts\Ollama-Status.sh` | macOS/Linux status check |
| `Scripts\Ollama-Status.cmd` | Windows cmd status check |

#### MCP Servers Configured

| Server | Package | Purpose |
|--------|---------|---------|
| filesystem | `@modelcontextprotocol/server-filesystem` | Read/write/search vault files |
| brave-search | `@brave/brave-search-mcp-server` | Web search (needs `BRAVE_API_KEY` env var) |
| shell | `super-shell-mcp` | Run shell commands (whitelist-based) |
| ollama | `ollama-mcp` | Query local Ollama models |

#### Ollama Models Configured

| Model | Use Case |
|-------|----------|
| gemma4:26b | General purpose |
| mxbai-embed-large | Embeddings |
| qwen2.5-coder:7b | Code tasks |
| llama3.2:3b | Quick queries |

#### Cross-Platform Design

- Uses `npx -y` for all MCP servers (auto-downloads, works everywhere)
- Uses `"."` for vault path (no hardcoded OS-specific paths)
- Uses `${env:VAR}` for secrets (API keys stay in environment)
- Scripts in 3 formats: `.ps1` + `.sh` + `.cmd`

---

## Current Ollama Status

Ollama is running at `http://localhost:11434`.

**Installed models:**
- kairos:latest
- llama3:8b
- granite4.2:latest
- qwen3.8:latest
- ornith-1.5:9b

**Not yet pulled:**
- gemma4:26b
- mxbai-embed-large
- qwen2.5-coder:7b
- llama3.2:3b

**To pull configured models:**
```powershell
.\Scripts\Ollama-Status.ps1 -PullMissing
```

Or edit `Scripts\ollama-models.json` to match desired models first.

---

## Next Steps

- [ ] Pull configured Ollama models (or update `ollama-models.json` to match what you want)
- [ ] Set `BRAVE_API_KEY` environment variable on each machine if using Brave Search
- [ ] Test MCP servers after next OpenCode session restart
- [ ] Commit `opencode.jsonc` and `Scripts\ollama-models.json` to git

---

*Session date: 2026-09-03 | Duration: ~1 hour*
