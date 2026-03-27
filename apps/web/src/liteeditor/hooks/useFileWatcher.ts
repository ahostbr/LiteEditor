import { useEffect } from "react";
import { useEditorStore } from "../stores/editor-store";

export function useFileWatcher() {
  const projectRoot = useEditorStore((s) => s.projectRoot);

  useEffect(() => {
    if (!projectRoot) return;

    window.api.fs.watchStart(projectRoot);

    const unsub = window.api.fs.onFileChange((_event, _path) => {
      // Could refresh file tree or update open files
      // For now this is handled in FileExplorer
    });

    return () => {
      unsub();
      window.api.fs.watchStop();
    };
  }, [projectRoot]);
}
