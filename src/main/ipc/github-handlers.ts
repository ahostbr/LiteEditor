import { ipcMain } from 'electron'
import { GitHubService } from '../services/github-service'

const github = new GitHubService()

export function registerGitHubHandlers(): void {
  // ── CLI status ──
  ipcMain.handle('github:check-cli', async () => {
    return github.checkCli()
  })

  ipcMain.handle('github:install-cli', async () => {
    return github.installCli()
  })

  ipcMain.handle('github:set-cwd', async (_e, cwd: string) => {
    github.setCwd(cwd)
  })

  // ── Repo ──
  ipcMain.handle('github:repo-info', async () => {
    return github.repoInfo()
  })

  // ── Pull Requests ──
  ipcMain.handle('github:pr-list', async (_e, state?: string) => {
    return github.prList(state)
  })

  ipcMain.handle('github:pr-get', async (_e, number: number) => {
    return github.prGet(number)
  })

  ipcMain.handle('github:pr-diff', async (_e, number: number) => {
    return github.prDiff(number)
  })

  ipcMain.handle('github:pr-create', async (_e, title: string, body: string, base: string, head: string, reviewers?: string[], labels?: string[]) => {
    return github.prCreate(title, body, base, head, reviewers, labels)
  })

  ipcMain.handle('github:pr-merge', async (_e, number: number, method: 'squash' | 'rebase' | 'merge', deleteBranch?: boolean) => {
    return github.prMerge(number, method, deleteBranch)
  })

  ipcMain.handle('github:pr-close', async (_e, number: number) => {
    return github.prClose(number)
  })

  ipcMain.handle('github:pr-reviews', async (_e, number: number) => {
    return github.prReviews(number)
  })

  ipcMain.handle('github:pr-review-comments', async (_e, number: number) => {
    return github.prReviewComments(number)
  })

  ipcMain.handle('github:pr-review-submit', async (_e, number: number, event: string, body: string, comments?: Array<{ path: string; line: number; body: string }>) => {
    return github.prSubmitReview(number, event as 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT', body, comments)
  })

  // ── Issues ──
  ipcMain.handle('github:issue-list', async (_e, state?: string) => {
    return github.issueList(state)
  })

  ipcMain.handle('github:issue-get', async (_e, number: number) => {
    return github.issueGet(number)
  })

  ipcMain.handle('github:issue-create', async (_e, title: string, body: string, labels?: string[], assignees?: string[]) => {
    return github.issueCreate(title, body, labels, assignees)
  })

  ipcMain.handle('github:issue-comment', async (_e, number: number, body: string) => {
    return github.issueComment(number, body)
  })

  ipcMain.handle('github:issue-close', async (_e, number: number) => {
    return github.issueClose(number)
  })

  ipcMain.handle('github:issue-reopen', async (_e, number: number) => {
    return github.issueReopen(number)
  })

  ipcMain.handle('github:issue-comments', async (_e, number: number) => {
    return github.issueComments(number)
  })

  // ── Helpers ──
  ipcMain.handle('github:labels-list', async () => {
    return github.labelsList()
  })

  ipcMain.handle('github:collaborators-list', async () => {
    return github.collaboratorsList()
  })

  ipcMain.handle('github:pr-template', async () => {
    return github.prTemplate()
  })
}
