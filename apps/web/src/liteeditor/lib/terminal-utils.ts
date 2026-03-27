import { useSettingsStore } from "../stores/settings-store";
import { useEditorStore } from "../stores/editor-store";

/**
 * Resolve the CWD for a new terminal session.
 * Fallback chain: explicit cwd → configured default → project root → undefined
 */
export function resolveTerminalCwd(cwd?: string): string | undefined {
  const explicitCwd = typeof cwd === "string" ? cwd.trim() : "";
  if (explicitCwd) return explicitCwd;

  const configuredCwd = useSettingsStore.getState().defaultTerminalCwd.trim();
  if (configuredCwd) return configuredCwd;

  return useEditorStore.getState().projectRoot || undefined;
}
