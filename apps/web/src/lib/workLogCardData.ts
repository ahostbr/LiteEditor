/**
 * Typed extractors for rich card data from WorkLogEntry.rawPayload.
 *
 * Each function defensively extracts structured data from the unknown payload,
 * returning null if the shape doesn't match. These replace the need for a
 * dedicated parser pipeline — the payload.itemType already discriminates the type.
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

// ── Bash / Command Execution ─────────────────────────────────────────────────

export interface BashCardData {
  command: string;
  stdout: string | null;
  exitCode: number | null;
  durationMs: number | null;
}

export function extractBashCardData(
  rawPayload: Record<string, unknown> | undefined,
): BashCardData | null {
  if (!rawPayload) return null;

  const detail = asString(rawPayload.detail);
  const data = asRecord(rawPayload.data);
  const item = asRecord(data?.item);
  const itemResult = asRecord(item?.result);
  const itemInput = asRecord(item?.input);

  const command =
    asString(item?.command) ??
    asString(itemInput?.command) ??
    asString(itemResult?.command) ??
    asString(data?.command);

  if (!command) return null;

  // Extract output: try result.stdout, then detail (stripping exit code suffix)
  let stdout = asString(itemResult?.stdout) ?? asString(itemResult?.output) ?? asString(data?.output);
  let exitCode = asNumber(itemResult?.exit_code) ?? asNumber(itemResult?.exitCode) ?? asNumber(data?.exitCode);

  // detail often contains the output with a trailing "<exited with exit code N>"
  if (!stdout && detail) {
    const match = /^(?<output>[\s\S]*?)(?:\s*<exited with exit code (?<code>\d+)>)\s*$/i.exec(detail);
    if (match?.groups) {
      stdout = match.groups.output?.trim() || null;
      if (exitCode === null) {
        const parsed = Number.parseInt(match.groups.code ?? "", 10);
        if (Number.isInteger(parsed)) exitCode = parsed;
      }
    } else {
      stdout = detail;
    }
  }

  const durationMs = asNumber(itemResult?.duration_ms) ?? asNumber(data?.durationMs) ?? null;

  return { command, stdout, exitCode, durationMs };
}

// ── File Change ──────────────────────────────────────────────────────────────

export interface FileChangeCardData {
  files: string[];
  totalFiles: number;
}

export function extractFileChangeCardData(
  rawPayload: Record<string, unknown> | undefined,
  changedFiles: ReadonlyArray<string> | undefined,
): FileChangeCardData | null {
  // Prefer already-extracted changedFiles from WorkLogEntry
  const files = changedFiles && changedFiles.length > 0 ? [...changedFiles] : [];

  if (files.length === 0) {
    // Try extracting from payload directly
    const data = asRecord(rawPayload?.data);
    const item = asRecord(data?.item);
    const path = asString(item?.path) ?? asString(item?.filePath) ?? asString(data?.path);
    if (path) files.push(path);
  }

  if (files.length === 0) return null;
  return { files, totalFiles: files.length };
}

// ── File Read / Content ──────────────────────────────────────────────────────

export interface FileContentCardData {
  path: string;
  content: string | null;
  lineCount: number | null;
}

export function extractFileContentCardData(
  rawPayload: Record<string, unknown> | undefined,
): FileContentCardData | null {
  if (!rawPayload) return null;

  const data = asRecord(rawPayload.data);
  const item = asRecord(data?.item);
  const itemResult = asRecord(item?.result);

  const path =
    asString(item?.path) ??
    asString(item?.filePath) ??
    asString(itemResult?.path) ??
    asString(data?.path);

  if (!path) return null;

  const content = asString(itemResult?.content) ?? asString(data?.content) ?? asString(rawPayload.detail);
  const lineCount = asNumber(itemResult?.totalLines) ?? asNumber(itemResult?.lineCount) ?? null;

  return { path, content, lineCount };
}

// ── Web Search ───────────────────────────────────────────────────────────────

export interface WebSearchCardData {
  query: string;
  results: string | null;
}

export function extractWebSearchCardData(
  rawPayload: Record<string, unknown> | undefined,
): WebSearchCardData | null {
  if (!rawPayload) return null;

  const data = asRecord(rawPayload.data);
  const item = asRecord(data?.item);
  const itemInput = asRecord(item?.input);

  const query =
    asString(itemInput?.query) ??
    asString(item?.query) ??
    asString(data?.query);

  if (!query) return null;

  const results = asString(rawPayload.detail) ?? asString(data?.output) ?? null;

  return { query, results };
}

// ── MCP Tool Call ────────────────────────────────────────────────────────────

export interface McpToolCardData {
  toolName: string;
  serverName: string | null;
  output: string | null;
}

export function extractMcpToolCardData(
  rawPayload: Record<string, unknown> | undefined,
): McpToolCardData | null {
  if (!rawPayload) return null;

  const data = asRecord(rawPayload.data);
  const item = asRecord(data?.item);
  const itemResult = asRecord(item?.result);

  const toolName =
    asString(rawPayload.title) ??
    asString(item?.toolName) ??
    asString(data?.toolName);

  if (!toolName) return null;

  const serverName = asString(item?.serverName) ?? asString(data?.serverName) ?? null;
  const output =
    asString(rawPayload.detail) ??
    asString(itemResult?.output) ??
    asString(itemResult?.content) ??
    null;

  return { toolName, serverName, output };
}
