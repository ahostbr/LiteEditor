export type FileStatus =
  | 'added'
  | 'modified'
  | 'deleted'
  | 'renamed'
  | 'copied'
  | 'untracked'
  | 'conflicted'
  | 'ignored'

export interface ChangedFile {
  path: string
  status: FileStatus
  staged: boolean
  oldPath?: string // For renames
}

export interface DiffLine {
  type: 'add' | 'delete' | 'context' | 'hunk'
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

export interface DiffHunk {
  header: string
  oldStart: number
  oldCount: number
  newStart: number
  newCount: number
  lines: DiffLine[]
}

export interface FileDiff {
  path: string
  hunks: DiffHunk[]
  additions: number
  deletions: number
  isBinary: boolean
}

export interface Commit {
  hash: string
  shortHash: string
  date: string
  message: string
  authorName: string
  authorEmail: string
}

export interface CommitDetails extends Commit {
  files: Array<{
    path: string
    status: string
    additions: number
    deletions: number
  }>
  body: string
}

export type RepositoryTab = 'changes' | 'history' | 'worktrees' | 'prs' | 'issues'
