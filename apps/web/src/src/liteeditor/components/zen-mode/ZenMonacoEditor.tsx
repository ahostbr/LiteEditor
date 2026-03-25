// @ts-nocheck
import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { getLanguageFromPath } from "../../lib/language-map";
import { useSettingsStore } from "../../stores/settings-store";
import { useZenStore } from "../../stores/zen-store";

interface ZenMonacoEditorProps {
  filePath: string;
  panelId: string;
}

export function ZenMonacoEditor({ filePath, panelId }: ZenMonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const settings = useSettingsStore();
  const markPanelDirty = useZenStore((s) => s.markPanelDirty);

  useEffect(() => {
    if (!containerRef.current) return;

    const language = getLanguageFromPath(filePath);
    const uri = monaco.Uri.file(filePath);
    const model = monaco.editor.getModel(uri);

    if (!model) {
      // Model should already exist (created by zen-store.addEditorPanel).
      // If somehow missing, defer editor creation until content is loaded.
      let cancelled = false;
      window.api.fs
        .readFile(filePath)
        .then((content) => {
          if (cancelled || !containerRef.current) return;
          const existing = monaco.editor.getModel(uri);
          const m = existing || monaco.editor.createModel(content, language, uri);
          createEditor(containerRef.current!, m);
        })
        .catch(() => {});
      return () => {
        cancelled = true;
        cleanup();
      };
    }

    createEditor(containerRef.current, model);
    return cleanup;

    function createEditor(container: HTMLElement, m: monaco.editor.ITextModel) {
      const editor = monaco.editor.create(container, {
        model: m,
        theme: "vs-dark",
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        tabSize: settings.tabSize,
        wordWrap: settings.wordWrap,
        minimap: { enabled: settings.minimap },
        lineNumbers: settings.lineNumbers,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderWhitespace: "selection",
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true },
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        padding: { top: 8 },
      });
      editorRef.current = editor;

      editor.onDidChangeModelContent(() => {
        markPanelDirty(panelId, true);
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
        const currentModel = editor.getModel();
        if (currentModel) {
          const content = currentModel.getValue();
          try {
            await window.api.fs.writeFile(filePath, content);
            markPanelDirty(panelId, false);
          } catch (err) {
            console.error("Failed to save file:", err);
          }
        }
      });
    }

    function cleanup() {
      editorRef.current?.dispose();
      editorRef.current = null;
    }
  }, [filePath]);

  // Update editor options when settings change
  useEffect(() => {
    editorRef.current?.updateOptions({
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap,
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers,
    });
  }, [
    settings.fontSize,
    settings.fontFamily,
    settings.tabSize,
    settings.wordWrap,
    settings.minimap,
    settings.lineNumbers,
  ]);

  return <div ref={containerRef} className="w-full h-full" />;
}
