// @ts-nocheck
import type { DiffHunk, DiffLine, FileDiff } from "../types/repository";

const HUNK_HEADER_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/;

export function parseDiff(diffText: string): FileDiff {
  const lines = diffText.split("\n");
  const hunks: DiffHunk[] = [];
  let currentHunk: DiffHunk | null = null;
  let additions = 0;
  let deletions = 0;
  let isBinary = false;
  let oldLine = 0;
  let newLine = 0;
  let path = "";

  for (const line of lines) {
    // Extract file path from diff header
    if (line.startsWith("diff --git")) {
      const match = line.match(/diff --git a\/.+ b\/(.+)/);
      if (match) path = match[1];
      continue;
    }

    if (line.startsWith("Binary files")) {
      isBinary = true;
      continue;
    }

    // Skip diff metadata lines
    if (line.startsWith("---") || line.startsWith("+++") || line.startsWith("index ")) {
      continue;
    }

    const hunkMatch = line.match(HUNK_HEADER_RE);
    if (hunkMatch) {
      if (currentHunk) hunks.push(currentHunk);
      oldLine = parseInt(hunkMatch[1], 10);
      newLine = parseInt(hunkMatch[3], 10);
      currentHunk = {
        header: line,
        oldStart: oldLine,
        oldCount: parseInt(hunkMatch[2] || "1", 10),
        newStart: newLine,
        newCount: parseInt(hunkMatch[4] || "1", 10),
        lines: [],
      };
      currentHunk.lines.push({ type: "hunk", content: hunkMatch[5]?.trim() || "" });
      continue;
    }

    if (!currentHunk) continue;

    if (line.startsWith("+")) {
      currentHunk.lines.push({
        type: "add",
        content: line.slice(1),
        newLineNumber: newLine++,
      });
      additions++;
    } else if (line.startsWith("-")) {
      currentHunk.lines.push({
        type: "delete",
        content: line.slice(1),
        oldLineNumber: oldLine++,
      });
      deletions++;
    } else if (line.startsWith(" ") || line === "") {
      currentHunk.lines.push({
        type: "context",
        content: line.slice(1),
        oldLineNumber: oldLine++,
        newLineNumber: newLine++,
      });
    }
  }

  if (currentHunk) hunks.push(currentHunk);

  return { path, hunks, additions, deletions, isBinary };
}
