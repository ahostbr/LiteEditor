/**
 * WorkLogRichCard — Expanded rich visualization for tool call results.
 *
 * Renders below a SimpleWorkEntryRow when expanded. Switches on workEntry.itemType
 * to show structured content: bash output, file changes, file reads, web search
 * results, or MCP tool output.
 */

import { memo, useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  FileCodeIcon,
  FilesIcon,
  GlobeIcon,
  TerminalIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import type { WorkLogEntry } from "../../session-logic";
import {
  extractBashCardData,
  extractFileChangeCardData,
  extractFileContentCardData,
  extractWebSearchCardData,
  extractMcpToolCardData,
} from "../../lib/workLogCardData";
import { cn } from "~/lib/utils";

interface WorkLogRichCardProps {
  workEntry: WorkLogEntry;
}

// ── Bash Output Section ──────────────────────────────────────────────────────

function BashOutputSection({ workEntry }: { workEntry: WorkLogEntry }) {
  const data = extractBashCardData(workEntry.rawPayload);
  if (!data) return null;

  const hasOutput = data.stdout && data.stdout.trim().length > 0;
  const exitSuccess = data.exitCode === null || data.exitCode === 0;

  return (
    <div className="space-y-2">
      {/* Command */}
      <div className="rounded-md border border-border/40 bg-background/60 px-2.5 py-1.5">
        <code className="break-all font-mono text-[11px] text-emerald-400">$ {data.command}</code>
      </div>

      {/* Output */}
      {hasOutput ? (
        <div className="rounded-md border border-border/40 bg-zinc-950/50 px-2.5 py-2">
          <pre className="max-h-48 overflow-x-auto overflow-y-auto whitespace-pre-wrap font-mono text-[10px] leading-4 text-foreground/80">
            {data.stdout}
          </pre>
        </div>
      ) : (
        <p className="text-center text-[10px] text-muted-foreground/50">No output</p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
        <span className={cn("flex items-center gap-1", exitSuccess ? "text-emerald-400/70" : "text-rose-400/70")}>
          {exitSuccess ? <CheckCircleIcon className="size-3" /> : <XCircleIcon className="size-3" />}
          {data.exitCode !== null ? `Exit ${data.exitCode}` : "OK"}
        </span>
        {data.durationMs !== null && (
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3" />
            {data.durationMs < 1000 ? `${data.durationMs}ms` : `${(data.durationMs / 1000).toFixed(1)}s`}
          </span>
        )}
      </div>
    </div>
  );
}

// ── File Change Section ──────────────────────────────────────────────────────

function FileChangeSection({ workEntry }: { workEntry: WorkLogEntry }) {
  const data = extractFileChangeCardData(workEntry.rawPayload, workEntry.changedFiles);
  if (!data) return null;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
        <FilesIcon className="size-3" />
        <span>{data.totalFiles} file{data.totalFiles !== 1 ? "s" : ""} changed</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {data.files.slice(0, 8).map((filePath) => (
          <span
            key={filePath}
            className="rounded-md border border-border/40 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/75"
            title={filePath}
          >
            {filePath}
          </span>
        ))}
        {data.totalFiles > 8 && (
          <span className="px-1 text-[10px] text-muted-foreground/50">
            +{data.totalFiles - 8} more
          </span>
        )}
      </div>
    </div>
  );
}

// ── File Content Section ─────────────────────────────────────────────────────

function FileContentSection({ workEntry }: { workEntry: WorkLogEntry }) {
  const data = extractFileContentCardData(workEntry.rawPayload);
  if (!data) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const hasContent = data.content && data.content.trim().length > 0;
  const lineCount = data.lineCount ?? (data.content ? data.content.split("\n").length : 0);

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 text-left transition-colors hover:text-foreground/90"
      >
        <FileCodeIcon className="size-3 text-blue-400/70" />
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/80">
          {data.path}
        </span>
        {lineCount > 0 && (
          <span className="text-[10px] text-muted-foreground/50">{lineCount} lines</span>
        )}
        {hasContent && (
          <span className="text-muted-foreground/50">
            {isExpanded ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />}
          </span>
        )}
      </button>

      {isExpanded && hasContent && (
        <div className="rounded-md border border-border/40 bg-zinc-950/50 px-2.5 py-2">
          <pre className="max-h-64 overflow-x-auto overflow-y-auto whitespace-pre font-mono text-[10px] leading-4 text-foreground/75">
            {data.content}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Web Search Section ───────────────────────────────────────────────────────

function WebSearchSection({ workEntry }: { workEntry: WorkLogEntry }) {
  const data = extractWebSearchCardData(workEntry.rawPayload);
  if (!data) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-[11px]">
        <GlobeIcon className="size-3 text-sky-400/70" />
        <span className="font-mono text-foreground/80">{data.query}</span>
      </div>

      {data.results && (
        <>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-muted-foreground/60 transition-colors hover:text-foreground/70"
          >
            {isExpanded ? "Hide results" : "Show results"}
          </button>
          {isExpanded && (
            <div className="rounded-md border border-border/40 bg-background/60 px-2.5 py-2">
              <pre className="max-h-48 overflow-x-auto overflow-y-auto whitespace-pre-wrap font-mono text-[10px] leading-4 text-foreground/75">
                {data.results}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── MCP Tool Section ─────────────────────────────────────────────────────────

function McpToolSection({ workEntry }: { workEntry: WorkLogEntry }) {
  const data = extractMcpToolCardData(workEntry.rawPayload);
  if (!data) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-[11px]">
        <WrenchIcon className="size-3 text-amber-400/70" />
        <span className="font-medium text-foreground/80">{data.toolName}</span>
        {data.serverName && (
          <span className="text-[10px] text-muted-foreground/50">({data.serverName})</span>
        )}
      </div>

      {data.output && (
        <>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-muted-foreground/60 transition-colors hover:text-foreground/70"
          >
            {isExpanded ? "Hide output" : "Show output"}
          </button>
          {isExpanded && (
            <div className="rounded-md border border-border/40 bg-zinc-950/50 px-2.5 py-2">
              <pre className="max-h-48 overflow-x-auto overflow-y-auto whitespace-pre-wrap font-mono text-[10px] leading-4 text-foreground/75">
                {data.output}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export const WorkLogRichCard = memo(function WorkLogRichCard({
  workEntry,
}: WorkLogRichCardProps) {
  if (!workEntry.rawPayload) return null;

  let content: React.ReactNode = null;

  switch (workEntry.itemType) {
    case "command_execution":
      content = <BashOutputSection workEntry={workEntry} />;
      break;
    case "file_change":
      content = <FileChangeSection workEntry={workEntry} />;
      break;
    case "web_search":
      content = <WebSearchSection workEntry={workEntry} />;
      break;
    case "mcp_tool_call":
      content = <McpToolSection workEntry={workEntry} />;
      break;
    default:
      // file-read: requestKind === "file-read" but may not have a dedicated itemType
      if (workEntry.requestKind === "file-read") {
        content = <FileContentSection workEntry={workEntry} />;
      }
      break;
  }

  if (!content) return null;

  return (
    <div className="mt-1 rounded-md border border-border/30 bg-card/20 px-2.5 py-2">
      {content}
    </div>
  );
});
