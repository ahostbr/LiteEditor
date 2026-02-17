import Database, { type Statement } from 'better-sqlite3'
import { readdir } from 'fs/promises'
import { join, dirname, basename } from 'path'

export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'out', '.cache',
  '__pycache__', '.vscode', '.idea', 'coverage', '.turbo'
])

export class FileTreeDB {
  private db: Database.Database
  private stmtInsert: Statement
  private stmtGetChildren: Statement
  private stmtIsScanned: Statement
  private stmtMarkScanned: Statement
  private stmtInvalidateDir: Statement
  private stmtDeleteByParent: Statement
  private stmtDeleteEntry: Statement

  constructor() {
    this.db = new Database(':memory:')
    this.db.pragma('journal_mode = OFF')
    this.db.pragma('synchronous = OFF')

    this.db.exec(`
      CREATE TABLE entries (
        path    TEXT PRIMARY KEY,
        parent  TEXT NOT NULL,
        name    TEXT NOT NULL,
        is_dir  INTEGER NOT NULL DEFAULT 0,
        scanned INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX idx_parent ON entries(parent);
    `)

    this.stmtInsert = this.db.prepare(
      'INSERT OR REPLACE INTO entries (path, parent, name, is_dir, scanned) VALUES (?, ?, ?, ?, ?)'
    )
    this.stmtGetChildren = this.db.prepare(
      'SELECT path, name, is_dir FROM entries WHERE parent = ? ORDER BY is_dir DESC, name COLLATE NOCASE ASC'
    )
    this.stmtIsScanned = this.db.prepare(
      'SELECT scanned FROM entries WHERE path = ?'
    )
    this.stmtMarkScanned = this.db.prepare(
      'UPDATE entries SET scanned = 1 WHERE path = ?'
    )
    this.stmtInvalidateDir = this.db.prepare(
      'UPDATE entries SET scanned = 0 WHERE path = ?'
    )
    this.stmtDeleteByParent = this.db.prepare(
      'DELETE FROM entries WHERE parent = ?'
    )
    this.stmtDeleteEntry = this.db.prepare(
      'DELETE FROM entries WHERE path = ?'
    )
  }

  /**
   * Read one directory from filesystem and insert entries into DB.
   */
  async scanDir(dirPath: string): Promise<void> {
    let entries: Awaited<ReturnType<typeof readdir>>
    try {
      entries = await readdir(dirPath, { withFileTypes: true })
    } catch {
      // Directory unreadable or gone — mark scanned with no children
      this.stmtDeleteByParent.run(dirPath)
      this.stmtMarkScanned.run(dirPath)
      return
    }

    const items: Array<{ path: string; parent: string; name: string; isDir: boolean }> = []
    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.env') continue
      if (IGNORED_DIRS.has(entry.name)) continue
      items.push({
        path: join(dirPath, entry.name),
        parent: dirPath,
        name: entry.name,
        isDir: entry.isDirectory()
      })
    }

    // Transaction: delete old children, insert fresh, mark scanned
    const insertAll = this.db.transaction(() => {
      // Get old directory children before deleting (for orphan cleanup)
      const oldDirs = (this.stmtGetChildren.all(dirPath) as Array<{ path: string; is_dir: number }>)
        .filter(r => r.is_dir === 1)
        .map(r => r.path)

      this.stmtDeleteByParent.run(dirPath)

      for (const item of items) {
        this.stmtInsert.run(item.path, item.parent, item.name, item.isDir ? 1 : 0, 0)
      }
      this.stmtMarkScanned.run(dirPath)

      // Clean up descendants of directories that no longer exist
      const newPaths = new Set(items.map(i => i.path))
      for (const oldDir of oldDirs) {
        if (!newPaths.has(oldDir)) {
          this.recursiveDelete(oldDir)
        }
      }
    })

    insertAll()
  }

  /**
   * Recursively remove a directory and all its descendants from the DB.
   */
  private recursiveDelete(dirPath: string): void {
    const children = this.stmtGetChildren.all(dirPath) as Array<{ path: string; is_dir: number }>
    this.stmtDeleteByParent.run(dirPath)
    this.stmtDeleteEntry.run(dirPath)
    for (const child of children) {
      if (child.is_dir === 1) {
        this.recursiveDelete(child.path)
      }
    }
  }

  /**
   * Get children of a directory. Scans from filesystem if not cached.
   * Returns flat FileNode[] — no nested children.
   */
  async getChildren(dirPath: string): Promise<FileNode[]> {
    const row = this.stmtIsScanned.get(dirPath) as { scanned: number } | undefined
    if (!row || row.scanned === 0) {
      await this.scanDir(dirPath)
    }

    const rows = this.stmtGetChildren.all(dirPath) as Array<{
      path: string
      name: string
      is_dir: number
    }>

    return rows.map(r => ({
      name: r.name,
      path: r.path,
      isDirectory: r.is_dir === 1
    }))
  }

  /**
   * Initialize root: insert root entry and return its children.
   */
  async initRoot(rootPath: string): Promise<FileNode[]> {
    this.stmtInsert.run(rootPath, dirname(rootPath), basename(rootPath), 1, 0)
    return this.getChildren(rootPath)
  }

  /**
   * Invalidate a path's parent directory so it re-scans on next access.
   */
  invalidatePath(filePath: string): void {
    this.stmtInvalidateDir.run(dirname(filePath))
  }

  /**
   * Clear all data (called on project root change).
   */
  clear(): void {
    this.db.exec('DELETE FROM entries')
  }

  /**
   * Close the database.
   */
  close(): void {
    this.db.close()
  }
}
