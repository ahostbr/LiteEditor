// @ts-nocheck
import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { getLanguageFromPath } from "../../lib/language-map";

interface DiffViewerProps {
  path: string;
  original: string;
  modified: string;
}

export function DiffViewer({ path, original, modified }: DiffViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IDiffEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const language = getLanguageFromPath(path);

    const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
      theme: "vs-dark",
      automaticLayout: true,
      readOnly: true,
      renderSideBySide: true,
      scrollBeyondLastLine: false,
      padding: { top: 8 },
    });

    const originalModel = monaco.editor.createModel(original, language);
    const modifiedModel = monaco.editor.createModel(modified, language);

    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    editorRef.current = diffEditor;

    return () => {
      diffEditor.dispose();
      originalModel.dispose();
      modifiedModel.dispose();
    };
  }, [path, original, modified]);

  return <div ref={containerRef} className="w-full h-full" />;
}

export default DiffViewer;
