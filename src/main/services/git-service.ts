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

    for (const f of result.staged) {
      files.push({ path: f.path, status: f.index, staged: true })
    }
    for (const f of result.files) {
      const isStaged = result.staged.some(s => s.path === f.path)
      if (!isStaged) {
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
}
