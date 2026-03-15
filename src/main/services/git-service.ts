import simpleGit, { type SimpleGit, type StatusResult } from 'simple-git'

export interface ChangedFile {
  path: string
  status: string
  staged: boolean
}

export interface CommitInfo {
  hash: string
  date: string
  message: string
  author_name: string
  author_email: string
}

export interface BranchInfo {
  current: string
  branches: Array<{
    name: string
    current: boolean
    commit: string
    label: string
  }>
}

export class GitService {
  private git: SimpleGit

  constructor(root: string) {
    this.git = simpleGit(root)
  }

  async status(): Promise<ChangedFile[]> {
    const result: StatusResult = await this.git.status()
    const files: ChangedFile[] = []

    const stagedSet = new Set(result.staged)
    for (const f of result.files) {
      if (stagedSet.has(f.path)) {
        files.push({ path: f.path, status: f.index, staged: true })
      } else {
        files.push({ path: f.path, status: f.working_dir, staged: false })
      }
    }

    return files
  }

  async diff(path: string): Promise<string> {
    return this.git.diff([path])
  }

  async diffCached(path: string): Promise<string> {
    return this.git.diff(['--cached', path])
  }

  async stage(path: string): Promise<void> {
    await this.git.add(path)
  }

  async stageAll(): Promise<void> {
    await this.git.add('-A')
  }

  async unstage(path: string): Promise<void> {
    await this.git.reset(['HEAD', path])
  }

  async unstageAll(): Promise<void> {
    await this.git.reset(['HEAD'])
  }

  async commit(message: string): Promise<void> {
    await this.git.commit(message)
  }

  async push(): Promise<{ ahead: number }> {
    await this.git.push()
    const status = await this.git.status()
    return { ahead: status.ahead }
  }

  async pull(): Promise<void> {
    await this.git.pull()
  }

  async fetch(): Promise<void> {
    await this.git.fetch()
  }

  async log(limit: number = 50): Promise<CommitInfo[]> {
    const result = await this.git.log({ maxCount: limit })
    return result.all.map(c => ({
      hash: c.hash,
      date: c.date,
      message: c.message,
      author_name: c.author_name,
      author_email: c.author_email
    }))
  }

  async branches(): Promise<BranchInfo> {
    const result = await this.git.branch()
    return {
      current: result.current,
      branches: Object.values(result.branches).map(b => ({
        name: b.name,
        current: b.current,
        commit: b.commit,
        label: b.label
      }))
    }
  }

  async currentBranch(): Promise<{ name: string; ahead: number; behind: number }> {
    const status = await this.git.status()
    return {
      name: status.current || 'HEAD',
      ahead: status.ahead,
      behind: status.behind
    }
  }

  async checkout(name: string): Promise<void> {
    await this.git.checkout(name)
  }

  async createBranch(name: string): Promise<void> {
    await this.git.checkoutLocalBranch(name)
  }

  async deleteBranch(name: string, force?: boolean): Promise<void> {
    if (force) {
      await this.git.branch(['-D', name])
    } else {
      await this.git.branch(['-d', name])
    }
  }

  async getFileAtRevision(path: string, rev: string): Promise<string> {
    return this.git.show([`${rev}:${path}`])
  }

  async discardChanges(path: string): Promise<void> {
    await this.git.checkout(['--', path])
  }

  // --- Worktree operations ---

  async worktreeList(): Promise<Array<{ path: string; branch: string; head: string; bare: boolean }>> {
    const result = await this.git.raw(['worktree', 'list', '--porcelain'])
    const worktrees: Array<{ path: string; branch: string; head: string; bare: boolean }> = []
    let current: { path: string; branch: string; head: string; bare: boolean } | null = null

    for (const line of result.split('\n')) {
      if (line.startsWith('worktree ')) {
        if (current) worktrees.push(current)
        current = { path: line.slice(9), branch: '', head: '', bare: false }
      } else if (line.startsWith('HEAD ') && current) {
        current.head = line.slice(5)
      } else if (line.startsWith('branch ') && current) {
        current.branch = line.slice(7).replace('refs/heads/', '')
      } else if (line === 'bare' && current) {
        current.bare = true
      } else if (line === '' && current) {
        worktrees.push(current)
        current = null
      }
    }
    if (current) worktrees.push(current)
    return worktrees
  }

  async worktreeAdd(path: string, branch: string, createBranch: boolean): Promise<void> {
    const args = ['worktree', 'add']
    if (createBranch) {
      args.push('-b', branch, path)
    } else {
      args.push(path, branch)
    }
    await this.git.raw(args)
  }

  async worktreeRemove(path: string): Promise<void> {
    await this.git.raw(['worktree', 'remove', path, '--force'])
  }

  async branchList(): Promise<Array<{ name: string; isRemote: boolean }>> {
    const result = await this.git.branch(['-a'])
    return Object.values(result.branches).map((b) => ({
      name: b.name,
      isRemote: b.name.startsWith('remotes/')
    }))
  }
}
