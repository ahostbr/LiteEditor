import { getMonacoContent, type Tab } from "../stores/editor-store";
import { useDialogStore } from "../stores/dialog-store";

/**
 * Prompt user to save a single dirty tab before closing.
 * Returns true if OK to proceed with close, false if cancelled.
 */
export async function confirmAndSaveTab(tab: Tab): Promise<boolean> {
  if (!tab.isDirty || tab.type !== "file" || !tab.path) return true;

  const result = await useDialogStore.getState().showDialog({
    title: "Unsaved Changes",
    message: `Do you want to save changes to ${tab.title}?`,
    detail: "Your changes will be lost if you don't save them.",
    buttons: [
      { label: "Save", variant: "primary" },
      { label: "Don't Save", variant: "destructive" },
      { label: "Cancel", variant: "muted" },
    ],
    cancelIndex: 2,
    icon: "warning",
  });

  if (result === 2) return false; // Cancel
  if (result === 0) {
    const content = getMonacoContent(tab.path);
    if (content !== undefined) {
      await window.api.fs.writeFile(tab.path, content);
    }
  }
  return true; // Save completed or Don't Save
}

/**
 * Prompt user to save multiple dirty tabs before closing.
 * Returns true if OK to proceed with close, false if cancelled.
 */
export async function confirmAndSaveTabs(tabs: Tab[]): Promise<boolean> {
  const dirty = tabs.filter((t) => t.isDirty && t.type === "file" && t.path);
  if (dirty.length === 0) return true;

  if (dirty.length === 1) return confirmAndSaveTab(dirty[0]);

  const result = await useDialogStore.getState().showDialog({
    title: "Unsaved Changes",
    message: `Save changes to ${dirty.length} files?`,
    detail: dirty.map((t) => t.title).join("\n"),
    detailMonospace: true,
    buttons: [
      { label: "Save All", variant: "primary" },
      { label: "Don't Save", variant: "destructive" },
      { label: "Cancel", variant: "muted" },
    ],
    cancelIndex: 2,
    icon: "warning",
  });

  if (result === 2) return false; // Cancel
  if (result === 0) {
    for (const tab of dirty) {
      const content = getMonacoContent(tab.path!);
      if (content !== undefined) {
        await window.api.fs.writeFile(tab.path!, content);
      }
    }
  }
  return true;
}
