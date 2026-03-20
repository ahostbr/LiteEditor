---
name: local-lens
description: Use when you need to process, summarize, or extract information from large content without bloating context. Triggers on 'summarize this', 'describe this screenshot', 'compress context', 'offload to local model', 'local-lens'. Routes through local LM Studio models. For planning use /plan-w-quizmaster, for expert analysis use /consult-polymaths.
allowed-tools: Bash
---

# Local Lens — LM Studio Model Manager & Context Compressor

You are using Local Lens to preprocess content through local models AND dynamically manage which models are loaded. This saves your context window for reasoning, not raw data.

## Why Use This

- Your context window is expensive and finite
- Small local models can summarize content quickly
- Devstral 24B handles complex coding/RAG tasks locally in seconds
- 15,000 tokens of raw content becomes 300-500 tokens of structured summary
- You can load/unload models on demand — no need to ask the user

## Model Inventory

Query LM Studio for currently available models:

```bash
curl -s http://localhost:1234/api/v0/models | python -c "
import json,sys
for m in json.load(sys.stdin)['data']:
    print(f\"{m['id']:55s} state={m['state']:12s} quant={m.get('quantization','?'):8s} ctx={m.get('loaded_context_length', m.get('max_context_length','?'))}\")
"
```

**Common model classes** (actual availability depends on your LM Studio installation):

| Class | Params | Typical VRAM | Role |
|-------|--------|--------------|------|
| Small VLM (e.g. 0.8B) | ~1B | ~2 GB | Fast summarizer, vision, preprocessing |
| Mid-tier (e.g. 4B) | ~4B | ~3-5 GB | General purpose |
| Strong local (e.g. 9B) | ~9B | ~10 GB | Reasoning, extraction |
| Heavy coder (e.g. 24B) | ~24B | ~15 GB | Coding, RAG, complex analysis |

Check your GPU's VRAM budget before loading multiple models. Use `lms ps` to see what's loaded.

## Python Switcher Script (Recommended)

The `lms_switch.py` script at `./lms_switch.py` wraps all model management with VRAM safety checks, named profiles, and role presets.

```bash
# Check current status
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" status

# Switch profiles (safely unloads first, checks VRAM budget)
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" load default      # 0.8B @ 8k
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" load litespeak    # 0.8B @ 4k (dictation)
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" load duo          # 0.8B @ 8k + Devstral @ 32k
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" load reasoning    # 0.8B @ 8k + Opus 9B @ 16k
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" load maxpower     # Devstral solo @ 65k
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" load coding       # Devstral solo @ 32k

# Load a specific model only if not already loaded (VRAM-safe)
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" ensure "mistralai/devstral-small-2-2512"

# Unload
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" unload --all
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" unload devstral

# Install/list role presets (system prompts + temperature + stop strings)
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" presets
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" preset summarizer
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" preset rag-strict
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" preset tts
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" preset coder
python "$USERPROFILE/.claude/skills/local-lens/lms_switch.py" preset extractor
```

**ALWAYS prefer the Python script over raw CLI commands** — it handles VRAM math, safe unloading, and identifier assignment automatically.

## Raw CLI: Model Management (Low-Level)

The `lms` CLI at `$USERPROFILE/.lmstudio/bin/lms.exe` manages models directly.

### Check what's loaded
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" ps
```

### Load a model
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" load "<model-key>" -y -c <context_length> --gpu max --identifier "<short-name>"
```
- `-y` auto-confirms prompts (required for non-interactive use)
- `-c` sets context window (use 4096-8192 for 0.8B, 16384 for 9B, 32768 for Devstral)
- `--gpu max` uses full GPU offload
- `--identifier` sets the API name (use this to reference the model in API calls)
- `--ttl <seconds>` optional auto-unload after idle (e.g., `--ttl 300` = 5 min)

### Unload a model
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" unload <identifier>
```
Note: `unload` does NOT support `-y`. Just pass the identifier directly.

### Unload all models
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" unload --all
```

### Check available models on disk
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" ls
```

### Detailed model info (v0 API)
```bash
curl -s http://localhost:1234/api/v0/models | python -c "
import json,sys
for m in json.load(sys.stdin)['data']:
    print(f\"{m['id']:55s} state={m['state']:12s} quant={m.get('quantization','?'):8s} ctx={m.get('loaded_context_length', m.get('max_context_length','?'))}\")
"
```

## Load Profiles

Pre-configured combos for common scenarios:

### Profile: Always-On (default)
Just a small model @ 8k — fast preprocessing, minimal VRAM.
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" load "qwen3.5-0.8b" -y -c 8192 --gpu max
```

### Profile: LiteSpeak (dictation)
Small model @ 4k — absolute minimum for dictation cleanup. Fastest possible.
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" load "qwen3.5-0.8b" -y -c 4096 --gpu max
```

### Profile: Summarizer + Heavy Hitter (duo)
Small model @ 8k + Devstral @ 32k for complex analysis.
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" load "qwen3.5-0.8b" -y -c 8192 --gpu max
"$USERPROFILE/.lmstudio/bin/lms.exe" load "mistralai/devstral-small-2-2512" -y -c 32768 --gpu max --identifier "devstral"
```

### Profile: Reasoning Stack
Small model @ 8k + reasoning-tuned 9B @ 16k.
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" load "qwen3.5-0.8b" -y -c 8192 --gpu max
"$USERPROFILE/.lmstudio/bin/lms.exe" load "qwen3.5-9b-claude-4.6-opus-reasoning-distilled" -y -c 16384 --gpu max --identifier "opus-9b"
```

### Profile: Max Power (Devstral solo)
Full VRAM to Devstral @ 65k for heavy coding/RAG.
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" unload --all
"$USERPROFILE/.lmstudio/bin/lms.exe" load "mistralai/devstral-small-2-2512" -y -c 65536 --gpu max --identifier "devstral"
```

## Model Management Protocol

**CRITICAL VRAM SAFETY RULE: ALWAYS unload before loading heavy models.**

Before loading a model, check your available VRAM with:
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" ps 2>&1
```

**General safe combos:**
- Small model (~2 GB) + anything = usually fine
- Small + 4B (~4.5 GB) = fine (~6.5 GB)
- Small + 9B (~10 GB) = fine (~12 GB)
- Small + Devstral (~15 GB) = fine (~17 GB)
- Devstral alone = fine
- 9B alone or 9B + small = fine

**If the model you need is NOT loaded:**
1. Check what's currently loaded and its VRAM usage
2. **UNLOAD models that conflict** before loading — do NOT rely on auto-eviction
3. Load the model you need with appropriate context length
4. Verify with `lms ps` after loading

**Standard unload-then-load pattern:**
```bash
# Example: switching to Devstral — unload everything first
"$USERPROFILE/.lmstudio/bin/lms.exe" unload --all
"$USERPROFILE/.lmstudio/bin/lms.exe" load "mistralai/devstral-small-2-2512" -y -c 32000 --gpu max --identifier "devstral"
```

**After heavy work, always restore the small default model:**
```bash
"$USERPROFILE/.lmstudio/bin/lms.exe" unload --all
"$USERPROFILE/.lmstudio/bin/lms.exe" load "qwen3.5-0.8b" -y -c 8192 --gpu max
```

## API Usage

### Configuration
```
LM_STUDIO_URL=http://localhost:1234/v1
LMS_CLI="$USERPROFILE/.lmstudio/bin/lms.exe"
```

### Mode 1: Summarize Text (small model)

For long text, transcripts, documents, or any content over ~500 words. Ensure a small model is loaded.

```bash
curl -s http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5-0.8b",
    "messages": [
      {"role": "system", "content": "You are a precision summarizer. Extract ALL key facts, names, numbers, decisions, and actionable items. Be thorough but concise. Use bullet points. Never fabricate information not in the source text."},
      {"role": "user", "content": "Summarize the following content:\n\n<CONTENT_HERE>"}
    ],
    "max_tokens": 800,
    "temperature": 0.1
  }'
```

### Mode 2: Targeted Extraction (small model)

When you need specific information from a large body of content.

```bash
curl -s http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5-0.8b",
    "messages": [
      {"role": "system", "content": "Extract ONLY the information requested. Be precise. If the information is not present, say so. Do not guess."},
      {"role": "user", "content": "From the following content, extract: <WHAT_YOU_NEED>\n\n<CONTENT_HERE>"}
    ],
    "max_tokens": 500,
    "temperature": 0.1
  }'
```

### Mode 3: Describe Image/Screenshot (Vision)

Only models with `type: "vlm"` in the v0 API support vision. Use the OpenAI vision format with base64-encoded images.

Check which models support vision:
```bash
curl -s http://localhost:1234/api/v0/models | python -c "
import json,sys
for m in json.load(sys.stdin)['data']:
    if m.get('type') == 'vlm':
        print(m['id'])
"
```

```python
# Python vision helper (works with any VLM model)
import json, urllib.request, base64

with open('image.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode()

payload = json.dumps({
    'model': 'qwen-0.8b',  # or any VLM model identifier
    'messages': [{
        'role': 'user',
        'content': [
            {'type': 'text', 'text': 'Describe this image in detail.'},
            {'type': 'image_url', 'image_url': {'url': f'data:image/png;base64,{b64}'}}
        ]
    }],
    'max_tokens': 500,
    'temperature': 0.1
}).encode()

req = urllib.request.Request('http://localhost:1234/v1/chat/completions',
    data=payload, headers={'Content-Type': 'application/json'})
resp = json.loads(urllib.request.urlopen(req, timeout=60).read())
print(resp['choices'][0]['message']['content'])
```

### Mode 4: Detailed Analysis (Devstral)

When accuracy matters — RAG queries, factual extraction, code analysis, anything where a small model might hallucinate. **Load Devstral first if not already loaded.**

```bash
# Ensure Devstral is loaded
"$USERPROFILE/.lmstudio/bin/lms.exe" ps 2>&1 | grep -q devstral || \
  "$USERPROFILE/.lmstudio/bin/lms.exe" load "mistralai/devstral-small-2-2512" -y -c 32000 --gpu max --identifier "devstral"

# Query it
curl -s http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "devstral",
    "messages": [
      {"role": "system", "content": "You are a precise analyst. Answer ONLY from the provided content. If something is not in the content, say so explicitly. Answer directly. Do not use any tools."},
      {"role": "user", "content": "<QUERY>\n\nContent:\n<CONTENT_HERE>"}
    ],
    "max_tokens": 1000,
    "temperature": 0.1
  }'
```

**IMPORTANT for Devstral:** Always include "Do not use any tools." in the system prompt — it's a coding agent model and will try `[TOOL_CALLS]` otherwise.

### Mode 5: Local Reasoning (larger model)

For tasks needing stronger reasoning. **Load the model first if not already loaded.**

```bash
curl -s http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "opus-9b",
    "messages": [
      {"role": "system", "content": "<SYSTEM_PROMPT>"},
      {"role": "user", "content": "<USER_PROMPT>"}
    ],
    "max_tokens": 1000,
    "temperature": 0.3
  }'
```

## Routing Rules

| Task | Model | Load if needed? |
|------|-------|----------------|
| General summarization | small (0.8B) | Usually already loaded |
| Quick gist / TL;DR | small (0.8B) | Usually already loaded |
| Factual extraction | devstral | Yes — load on demand |
| Code summarization / review | devstral | Yes — load on demand |
| RAG-style Q&A over content | devstral | Yes — load on demand |
| Complex reasoning | 9B reasoning model | Yes — load on demand |
| Quick screenshot/image description | small VLM | Usually already loaded |
| Detailed image analysis | devstral | Yes — load on demand (VLM) |
| TTS-friendly text generation | small (0.8B) | Usually already loaded |

## Smart Loading Strategy

1. **Keep a small model always loaded** — it's tiny (~2 GB) and handles 80% of preprocessing tasks
2. **Load heavy models on demand** — Devstral/9B only when you actually need them
3. **Use `--ttl`** for temporary loads — e.g., `--ttl 300` auto-unloads after 5 min idle
4. **Check before loading** — don't reload what's already there
5. **Restore small model after heavy work** — if a big model evicted it, reload when done

## Implementation Steps

1. **Check what's loaded**: `lms ps`
2. **Load needed model** if not present (see Load Profiles above)
3. **Prepare content**: Escape for JSON. For large content (>30k chars), truncate or chunk.
4. **Send to local model**: Use the appropriate mode above.
5. **Parse response**: Extract `choices[0].message.content`. Check for errors.
6. **Restore default state**: If you loaded a heavy model temporarily, consider unloading it and restoring the small model.

## Python Helper for Complex Content

For content that's hard to escape in bash (quotes, special chars, multiline):

```bash
python -c "
import json, urllib.request

content = open('/path/to/file').read()
payload = json.dumps({
    'model': 'qwen3.5-0.8b',
    'messages': [
        {'role': 'system', 'content': 'You are a precision summarizer. Extract ALL key facts, names, numbers, decisions, and actionable items. Be thorough but concise. Use bullet points.'},
        {'role': 'user', 'content': f'Summarize:\n\n{content}'}
    ],
    'max_tokens': 800,
    'temperature': 0.1
}).encode()

req = urllib.request.Request('http://localhost:1234/v1/chat/completions',
    data=payload, headers={'Content-Type': 'application/json'})
resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
print(resp['choices'][0]['message']['content'])
"
```

## Important Caveats

- Small models **will lose nuance**. For legal text, exact numbers, or subtle meaning, read the raw content yourself.
- Small models **may hallucinate** details not in the source. For critical facts, use Devstral or verify yourself.
- If LM Studio is offline, **fall back gracefully** — just do the work yourself and note that Local Lens was unavailable.
- **Never present the local model's summary as your own analysis.** Say "Based on local preprocessing..." or similar.
- Content with special characters needs proper JSON escaping. Use the Python helper above.
- **Devstral will try tool calls** if you don't explicitly tell it not to. Always include "Do not use any tools." in its system prompt.
- **Loading large models evicts small ones.** Always check `lms ps` after loading to see what survived.
