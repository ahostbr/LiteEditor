import { watch, type FSWatcher } from 'chokidar'

export class FileWatcher {
  private watcher: FSWatcher

  constructor(
    root: string,
    onChange: (event: string, path: string) => void
  ) {
    this.watcher = watch(root, {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/out/**',
        '**/.next/**'
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      }
    })

    this.watcher
      .on('add', (path) => onChange('add', path))
      .on('change', (path) => onChange('change', path))
      .on('unlink', (path) => onChange('unlink', path))
      .on('addDir', (path) => onChange('addDir', path))
      .on('unlinkDir', (path) => onChange('unlinkDir', path))
  }

  close(): void {
    this.watcher.close()
  }
}
