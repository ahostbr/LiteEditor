// @ts-nocheck
import { watch, type FSWatcher } from "chokidar";

const IGNORED = ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/out/**", "**/.next/**"];

export class FileWatcher {
  private watchers: Map<string, FSWatcher> = new Map();
  private onChange: (event: string, path: string) => void;

  constructor(onChange: (event: string, path: string) => void) {
    this.onChange = onChange;
  }

  watchDir(dirPath: string): void {
    if (this.watchers.has(dirPath)) return;
    const watcher = watch(dirPath, {
      ignored: IGNORED,
      persistent: true,
      ignoreInitial: true,
      depth: 0,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    watcher
      .on("add", (path) => this.onChange("add", path))
      .on("change", (path) => this.onChange("change", path))
      .on("unlink", (path) => this.onChange("unlink", path))
      .on("addDir", (path) => this.onChange("addDir", path))
      .on("unlinkDir", (path) => this.onChange("unlinkDir", path));

    this.watchers.set(dirPath, watcher);
  }

  unwatchDir(dirPath: string): void {
    const watcher = this.watchers.get(dirPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(dirPath);
    }
  }

  closeAll(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
  }
}
