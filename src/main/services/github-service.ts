import { execFile } from 'child_process'
import { readFile } from 'fs/promises'
import { join } from 'path'

function exec(cmd: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd, maxBuffer: 10 * 1024 * 1024, timeout: 30000 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message))
      } else {
        resolve(stdout)
      }
    })
  })
}

export class GitHubService {
  private cwd: string = ''

  setCwd(cwd: string): void {
    this.cwd = cwd
  }

  // ── gh CLI status ──

  async isInstalled(): Promise<boolean> {
    try {
      await exec('gh', ['--version'], this.cwd || '.')
      return true
    } catch {
      return false
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await exec('gh', ['auth', 'status'], this.cwd || '.')
      return true
    } catch {
      return false
    }
  }

  async checkCli(): Promise<{ installed: boolean; authenticated: boolean }> {
    const installed = await this.isInstalled()
    if (!installed) return { installed: false, authenticated: false }
    const authenticated = await this.isAuthenticated()
    return { installed, authenticated }
  }

  async installCli(): Promise<{ success: boolean; error?: string }> {
    try {
      await exec('winget', ['install', '--id', 'GitHub.cli', '-e', '--accept-source-agreements', '--accept-package-agreements'], '.')
      return { success: true }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  }

  // ── Helper: run gh with JSON output ──

  private async gh(args: string[]): Promise<string> {
    return exec('gh', args, this.cwd)
  }

  private async ghJson<T>(args: string[]): Promise<T> {
    const result = await this.gh(args)
    return JSON.parse(result)
  }

  // ── Repo info ──

  async repoInfo(): Promise<unknown> {
    return this.ghJson(['repo', 'view', '--json', 'name,owner,defaultBranchRef'])
  }

  // ── Pull Requests ──

  async prList(state: string = 'open', limit: number = 50): Promise<unknown[]> {
    const stateArg = state === 'all' ? '' : `--state=${state}`
    const args = ['pr', 'list', '--json', 'number,title,body,state,author,labels,reviewDecision,headRefName,baseRefName,additions,deletions,changedFiles,isDraft,mergeable,updatedAt,createdAt,comments,reviewRequests,url', '--limit', String(limit)]
    if (stateArg) args.push(stateArg)
    return this.ghJson(args)
  }

  async prGet(number: number): Promise<unknown> {
    return this.ghJson(['pr', 'view', String(number), '--json', 'number,title,body,state,author,labels,reviewDecision,headRefName,baseRefName,additions,deletions,changedFiles,isDraft,mergeable,updatedAt,createdAt,comments,reviewRequests,url'])
  }

  async prDiff(number: number): Promise<string> {
    return this.gh(['pr', 'diff', String(number)])
  }

  async prCreate(title: string, body: string, base: string, head: string, reviewers?: string[], labels?: string[]): Promise<unknown> {
    const args = ['pr', 'create', '--title', title, '--body', body, '--base', base, '--head', head]
    if (reviewers?.length) {
      for (const r of reviewers) args.push('--reviewer', r)
    }
    if (labels?.length) {
      for (const l of labels) args.push('--label', l)
    }
    return this.ghJson([...args, '--json', 'number,title,url'])
  }

  async prMerge(number: number, method: 'squash' | 'rebase' | 'merge', deleteBranch: boolean = false): Promise<string> {
    const args = ['pr', 'merge', String(number), `--${method}`]
    if (deleteBranch) args.push('--delete-branch')
    return this.gh(args)
  }

  async prClose(number: number): Promise<string> {
    return this.gh(['pr', 'close', String(number)])
  }

  async prReviews(number: number): Promise<unknown[]> {
    const result = await this.gh(['api', `repos/{owner}/{repo}/pulls/${number}/reviews`])
    return JSON.parse(result)
  }

  async prReviewComments(number: number): Promise<unknown[]> {
    const result = await this.gh(['api', `repos/{owner}/{repo}/pulls/${number}/comments`])
    return JSON.parse(result)
  }

  async prSubmitReview(number: number, event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT', body: string, comments?: Array<{ path: string; line: number; body: string }>): Promise<string> {
    const payload: Record<string, unknown> = { event, body }
    if (comments?.length) {
      payload.comments = comments.map((c) => ({
        path: c.path,
        position: c.line, // Note: GitHub API uses 'position' for diff position
        body: c.body
      }))
    }
    const args = ['api', '-X', 'POST', `repos/{owner}/{repo}/pulls/${number}/reviews`]
    for (const [key, val] of Object.entries(payload)) {
      if (typeof val === 'string') {
        args.push('-f', `${key}=${val}`)
      } else {
        args.push('--input', '-')
      }
    }
    // For complex payloads with comments, use raw JSON input
    if (comments?.length) {
      const jsonPayload = JSON.stringify(payload)
      return new Promise((resolve, reject) => {
        const proc = require('child_process').spawn('gh', ['api', '-X', 'POST', `repos/{owner}/{repo}/pulls/${number}/reviews`, '--input', '-'], { cwd: this.cwd })
        let stdout = ''
        let stderr = ''
        proc.stdout.on('data', (d: Buffer) => { stdout += d })
        proc.stderr.on('data', (d: Buffer) => { stderr += d })
        proc.on('close', (code: number) => {
          if (code === 0) resolve(stdout)
          else reject(new Error(stderr))
        })
        proc.stdin.write(jsonPayload)
        proc.stdin.end()
      })
    }
    return this.gh(args)
  }

  // ── Issues ──

  async issueList(state: string = 'open', limit: number = 50): Promise<unknown[]> {
    const args = ['issue', 'list', '--json', 'number,title,body,state,author,labels,assignees,milestone,comments,createdAt,updatedAt,url', '--limit', String(limit)]
    if (state !== 'all') args.push('--state', state)
    return this.ghJson(args)
  }

  async issueGet(number: number): Promise<unknown> {
    return this.ghJson(['issue', 'view', String(number), '--json', 'number,title,body,state,author,labels,assignees,milestone,comments,createdAt,updatedAt,url'])
  }

  async issueCreate(title: string, body: string, labels?: string[], assignees?: string[]): Promise<unknown> {
    const args = ['issue', 'create', '--title', title, '--body', body]
    if (labels?.length) {
      for (const l of labels) args.push('--label', l)
    }
    if (assignees?.length) {
      for (const a of assignees) args.push('--assignee', a)
    }
    return this.ghJson([...args, '--json', 'number,title,url'])
  }

  async issueComment(number: number, body: string): Promise<string> {
    return this.gh(['issue', 'comment', String(number), '--body', body])
  }

  async issueClose(number: number): Promise<string> {
    return this.gh(['issue', 'close', String(number)])
  }

  async issueReopen(number: number): Promise<string> {
    return this.gh(['issue', 'reopen', String(number)])
  }

  // ── Helpers ──

  async labelsList(): Promise<unknown[]> {
    const result = await this.gh(['label', 'list', '--json', 'name,color'])
    return JSON.parse(result)
  }

  async collaboratorsList(): Promise<string[]> {
    try {
      const result = await this.gh(['api', 'repos/{owner}/{repo}/collaborators', '--jq', '.[].login'])
      return result.trim().split('\n').filter(Boolean)
    } catch {
      return []
    }
  }

  async prTemplate(): Promise<string | null> {
    try {
      const template = await readFile(join(this.cwd, '.github', 'pull_request_template.md'), 'utf-8')
      return template
    } catch {
      try {
        const template = await readFile(join(this.cwd, 'pull_request_template.md'), 'utf-8')
        return template
      } catch {
        return null
      }
    }
  }

  async issueComments(number: number): Promise<unknown[]> {
    const result = await this.gh(['api', `repos/{owner}/{repo}/issues/${number}/comments`])
    return JSON.parse(result)
  }
}
