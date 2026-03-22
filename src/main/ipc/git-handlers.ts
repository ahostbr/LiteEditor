import { ipcMain } from 'electron'
import { GitService } from '../services/git-service'

let gitService: GitService | null = null

function getGit(): GitService {
  if (!gitService) throw new Error('Git service not initialized')
  return gitService
}

export function registerGitHandlers(): void {
  // Initialize git service when project root is set
  ipcMain.handle('git:init', async (_e, root: string) => {
    gitService = new GitService(root)
  })

  // Get current branch for an arbitrary path (used by sidebar per-project)
  ipcMain.handle('git:current-branch-for-path', async (_e, rootPath: string) => {
    const tempGit = new GitService(rootPath)
    return tempGit.currentBranch()
  })

  ipcMain.handle('git:status', async () => {
    return getGit().status()
  })

  ipcMain.handle('git:diff', async (_e, path: string) => {
    return getGit().diff(path)
  })

  ipcMain.handle('git:diff-cached', async (_e, path: string) => {
    return getGit().diffCached(path)
  })

  ipcMain.handle('git:stage', async (_e, path: string) => {
    return getGit().stage(path)
  })

  ipcMain.handle('git:stage-all', async () => {
    return getGit().stageAll()
  })

  ipcMain.handle('git:unstage', async (_e, path: string) => {
    return getGit().unstage(path)
  })

  ipcMain.handle('git:unstage-all', async () => {
    return getGit().unstageAll()
  })

  ipcMain.handle('git:commit', async (_e, summary: string, description?: string) => {
    const message = description ? `${summary}\n\n${description}` : summary
    return getGit().commit(message)
  })

  ipcMain.handle('git:push', async () => {
    return getGit().push()
  })

  ipcMain.handle('git:pull', async () => {
    return getGit().pull()
  })

  ipcMain.handle('git:fetch', async () => {
    return getGit().fetch()
  })

  ipcMain.handle('git:log', async (_e, limit?: number) => {
    return getGit().log(limit)
  })

  ipcMain.handle('git:branches', async () => {
    return getGit().branches()
  })

  ipcMain.handle('git:current-branch', async () => {
    return getGit().currentBranch()
  })

  ipcMain.handle('git:checkout', async (_e, name: string) => {
    return getGit().checkout(name)
  })

  ipcMain.handle('git:create-branch', async (_e, name: string) => {
    return getGit().createBranch(name)
  })

  ipcMain.handle('git:delete-branch', async (_e, name: string, force?: boolean) => {
    return getGit().deleteBranch(name, force)
  })

  ipcMain.handle('git:file-at-revision', async (_e, path: string, rev: string) => {
    return getGit().getFileAtRevision(path, rev)
  })

  ipcMain.handle('git:discard-changes', async (_e, path: string) => {
    return getGit().discardChanges(path)
  })

  ipcMain.handle('git:show-commit', async (_e, hash: string) => {
    return getGit().showCommit(hash)
  })

  ipcMain.handle('git:diff-commit-file', async (_e, hash: string, path: string) => {
    return getGit().diffCommitFile(hash, path)
  })

  ipcMain.handle('git:status-porcelain', async () => {
    return getGit().statusPorcelain()
  })

  // Worktree operations
  ipcMain.handle('git:worktree-list', async () => {
    return getGit().worktreeList()
  })

  ipcMain.handle('git:worktree-add', async (_e, path: string, branch: string, createBranch: boolean) => {
    return getGit().worktreeAdd(path, branch, createBranch)
  })

  ipcMain.handle('git:worktree-remove', async (_e, path: string) => {
    return getGit().worktreeRemove(path)
  })

  ipcMain.handle('git:branch-list', async () => {
    return getGit().branchList()
  })

  // Get porcelain status for an arbitrary path (used by sidebar per-project dirty indicator)
  ipcMain.handle('git:status-porcelain-for-path', async (_e, rootPath: string) => {
    const tempGit = new GitService(rootPath)
    return tempGit.statusPorcelain()
  })
}
