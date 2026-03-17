# Plan: Phase 13 — GitHub Integration (PRs + Issues)

## Task Description

Add full GitHub PR and Issue management as new tabs inside LiteEditor's existing Git canvas pane. Users can list, create, review (with inline line comments), merge PRs, and manage issues — all without leaving the editor. Powered by the `gh` CLI for authentication and API access.

## Objective

- **PRs**: Full lifecycle — list, view diff, create (with template detection), inline code review with line-level comments, approve/request changes, merge/close
- **Issues**: Full lifecycle — list/filter, create, comment, close/reopen, link to branches
- **Auth**: `gh` CLI with check → prompt → auto-install option
- **All destructive actions** (merge, close, delete, approve) require confirmation dialog

## Problem Statement

Developers currently context-switch to GitHub.com or GitHub Desktop for PR reviews, issue triage, and branch management. LiteEditor's canvas already has a git pane (Changes/History) — extending it with PRs and Issues keeps developers in their spatial workspace. The `gh` CLI is already installed by most GitHub-using developers, making auth trivial.

## Solution Approach

### Architecture

```
Main Process (src/main/)
├── services/github-service.ts     ← Shells out to `gh` CLI with --json flags
├── ipc/github-handlers.ts         ← IPC channels: github:pr-list, github:issue-create, etc.

Preload (src/preload/index.ts)
├── window.api.github.*            ← PR, Issue, and gh CLI operations

Renderer (src/renderer/)
├── stores/github-store.ts         ← Zustand store for PRs + Issues state
├── types/github.ts                ← PR, Issue, Review, Comment types
├── components/git/
│   ├── RepositoryView.tsx         ← MODIFIED: add 'prs' and 'issues' tabs
│   ├── PullRequestsPanel.tsx      ← PR list + filters
│   ├── PullRequestDetail.tsx      ← PR detail: diff + inline review + merge
│   ├── PullRequestCreate.tsx      ← Create PR form with template detection
│   ├── InlineReviewComment.tsx    ← Line-level comment thread component
│   ├── IssuesPanel.tsx            ← Issue list + filters
│   ├── IssueDetail.tsx            ← Issue detail: comments + actions
│   ├── IssueCreate.tsx            ← Create issue form
│   └── GhCliSetup.tsx             ← gh CLI detection + install prompt
```

### gh CLI Integration Pattern

All GitHub API calls go through `gh` CLI with `--json` flags for structured output:

```typescript
// Example: list PRs
const result = execSync('gh pr list --json number,title,state,author,labels,reviewDecision,headRefName,updatedAt --limit 50', { cwd: repoPath })
const prs = JSON.parse(result.toString())

// Example: create PR
execSync(`gh pr create --title "${title}" --body "${body}" --base ${base} --head ${head}`, { cwd: repoPath })

// Example: inline review comment
execSync(`gh api repos/{owner}/{repo}/pulls/{pr}/reviews -f body="${reviewBody}" -f event=APPROVE`, { cwd: repoPath })
```

### Data Models

```typescript
// Pull Request
interface PullRequest {
  number: number
  title: string
  body: string
  state: 'open' | 'closed' | 'merged'
  author: { login: string; avatarUrl?: string }
  labels: Array<{ name: string; color: string }>
  reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null
  headRefName: string
  baseRefName: string
  additions: number
  deletions: number
  changedFiles: number
  isDraft: boolean
  mergeable: 'MERGEABLE' | 'CONFLICTING' | 'UNKNOWN'
  updatedAt: string
  createdAt: string
  comments: number
  reviewRequests: Array<{ login: string }>
}

// PR Review Comment (inline)
interface ReviewComment {
  id: number
  body: string
  path: string
  line: number
  side: 'LEFT' | 'RIGHT'
  author: { login: string }
  createdAt: string
  inReplyToId?: number
}

// PR Review
interface Review {
  id: number
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'PENDING'
  body: string
  author: { login: string }
  comments: ReviewComment[]
  submittedAt: string
}

// Issue
interface Issue {
  number: number
  title: string
  body: string
  state: 'open' | 'closed'
  author: { login: string }
  labels: Array<{ name: string; color: string }>
  assignees: Array<{ login: string }>
  milestone: { title: string } | null
  comments: number
  createdAt: string
  updatedAt: string
}

// Issue Comment
interface IssueComment {
  id: number
  body: string
  author: { login: string }
  createdAt: string
}
```

## Relevant Files

### New Files
| File | Purpose |
|------|---------|
| `src/main/services/github-service.ts` | gh CLI wrapper — exec with --json, parse output, error handling |
| `src/main/ipc/github-handlers.ts` | IPC channels for all GitHub operations |
| `src/renderer/stores/github-store.ts` | Zustand store for PRs, issues, reviews, gh CLI status |
| `src/renderer/types/github.ts` | TypeScript types for PRs, issues, reviews, comments |
| `src/renderer/components/git/PullRequestsPanel.tsx` | PR list with filters (open/closed/draft), search |
| `src/renderer/components/git/PullRequestDetail.tsx` | PR detail view: info header, diff with inline comments, merge actions |
| `src/renderer/components/git/PullRequestCreate.tsx` | Create PR form: title, body (with template), base/head branch, reviewers, labels |
| `src/renderer/components/git/InlineReviewComment.tsx` | Line-level comment thread in diff viewer |
| `src/renderer/components/git/IssuesPanel.tsx` | Issue list with filters (open/closed, label, assignee) |
| `src/renderer/components/git/IssueDetail.tsx` | Issue detail: body, comments, close/reopen actions |
| `src/renderer/components/git/IssueCreate.tsx` | Create issue form: title, body, labels, assignees |
| `src/renderer/components/git/GhCliSetup.tsx` | gh CLI detection banner + install prompt/auto-install |

### Modified Files
| File | Change |
|------|--------|
| `src/renderer/components/git/RepositoryView.tsx` | Add 'prs' and 'issues' tabs, render new panels |
| `src/renderer/components/git/DiffViewer.tsx` | Add inline comment support (clickable line gutters, comment threads) |
| `src/renderer/types/repository.ts` | Extend RepositoryTab union with 'prs' and 'issues' |
| `src/preload/index.ts` | Add `window.api.github.*` namespace |
| `src/main/index.ts` | Register github handlers |

## Execution Workflow

1. **Create worktree** → `superpowers:using-git-worktrees` — isolate from main
2. **Write tests** → `superpowers:test-driven-development` — E2E tests for gh CLI integration
3. **Implement** → Phase-by-phase (see tasks below)
4. **Debug failures** → `superpowers:systematic-debugging`
5. **Verify** → `superpowers:verification-before-completion` — build + typecheck + tests
6. **Review** → `superpowers:requesting-code-review`
7. **Finish branch** → `superpowers:finishing-a-development-branch`

## Step by Step Tasks

### Phase 13.1: gh CLI Service + IPC + Auth Check

**Goal:** Main-process service that wraps `gh` CLI, IPC handlers, preload API, and auth detection.

#### Task 13.1.1: GitHub service (main process)
- Create `src/main/services/github-service.ts`
- `execGh(args: string[], cwd: string): Promise<string>` — shells out to `gh` with args, returns stdout
- `execGhJson<T>(args: string[], cwd: string): Promise<T>` — adds `--json` parsing
- `isGhInstalled(): Promise<boolean>` — checks `gh --version`
- `isGhAuthenticated(): Promise<boolean>` — checks `gh auth status`
- `getGhInstallCommand(): string` — returns `winget install GitHub.cli` or equivalent
- Error handling: parse gh stderr for auth errors, rate limits, network errors

#### Task 13.1.2: GitHub IPC handlers
- Create `src/main/ipc/github-handlers.ts`
- Channels:
  - `github:check-cli` → `{ installed: boolean, authenticated: boolean }`
  - `github:install-cli` → attempt auto-install via winget
  - **PRs:** `github:pr-list`, `github:pr-get`, `github:pr-create`, `github:pr-merge`, `github:pr-close`, `github:pr-diff`, `github:pr-reviews`, `github:pr-review-submit`, `github:pr-review-comment`
  - **Issues:** `github:issue-list`, `github:issue-get`, `github:issue-create`, `github:issue-comment`, `github:issue-close`, `github:issue-reopen`
  - **Helpers:** `github:repo-info`, `github:labels-list`, `github:users-list`, `github:milestones-list`, `github:pr-template`
- Register in `src/main/index.ts`

#### Task 13.1.3: Preload API surface
- Add `window.api.github.*` namespace with all channel methods
- Types: return `Promise<unknown>` (cast in renderer stores)

#### Task 13.1.4: GhCliSetup component
- Create `src/renderer/components/git/GhCliSetup.tsx`
- Shown when `github:check-cli` returns `installed: false`
- Banner with: "GitHub CLI not found" message, install instructions, "Install Now" button (triggers `github:install-cli`), "Open Download Page" link
- After install: re-check and show "Authenticate" prompt if needed (`gh auth login`)

**Validation:** `gh` CLI check works. If installed + authed, returns true. If not, shows setup banner.

---

### Phase 13.2: GitHub Store + Types

**Goal:** Zustand store and TypeScript types for PRs and Issues.

#### Task 13.2.1: GitHub types
- Create `src/renderer/types/github.ts`
- Types: `PullRequest`, `PullRequestDetail`, `ReviewComment`, `Review`, `Issue`, `IssueComment`, `IssueDetail`
- Extend `src/renderer/types/repository.ts`: add `'prs' | 'issues'` to `RepositoryTab`

#### Task 13.2.2: GitHub store
- Create `src/renderer/stores/github-store.ts`
- State: `ghCliReady`, `pullRequests[]`, `selectedPr`, `prDetail`, `prDiff`, `prReviews[]`, `issues[]`, `selectedIssue`, `issueComments[]`, `prFilter`, `issueFilter`, `isLoading`, `pendingReviewComments[]`
- Actions:
  - `checkGhCli()` — check install + auth status
  - `loadPullRequests(filter?)` — list PRs
  - `selectPullRequest(number)` — load detail + diff + reviews
  - `createPullRequest(title, body, base, head, reviewers?, labels?)` — create PR
  - `mergePullRequest(number, method)` — merge with confirmation
  - `closePullRequest(number)` — close with confirmation
  - `submitReview(prNumber, event, body, comments[])` — submit batched review
  - `addPendingReviewComment(path, line, body)` — stage a review comment
  - `loadIssues(filter?)` — list issues
  - `selectIssue(number)` — load detail + comments
  - `createIssue(title, body, labels?, assignees?)` — create issue
  - `commentOnIssue(number, body)` — add comment
  - `closeIssue(number)` / `reopenIssue(number)` — with confirmation
  - `createBranchFromIssue(number)` — create branch named `issue-{number}-{slug}`

**Validation:** Store actions callable, types compile, no build errors.

---

### Phase 13.3: PR List + Detail View

**Goal:** PRs tab in the Git pane showing list and detail.

#### Task 13.3.1: Update RepositoryView with new tabs
- Add `'prs'` and `'issues'` to the tab bar in `RepositoryView.tsx`
- Render `PullRequestsPanel` for 'prs' tab
- Render `IssuesPanel` for 'issues' tab
- Show GhCliSetup banner if `ghCliReady` is false

#### Task 13.3.2: PullRequestsPanel
- Create `src/renderer/components/git/PullRequestsPanel.tsx`
- Filter bar: Open | Closed | Draft toggle
- PR list items showing: number, title, author, labels (colored badges), review status icon, branch name, time ago
- Click → selects PR, loads detail in right panel
- Refresh button

#### Task 13.3.3: PullRequestDetail
- Create `src/renderer/components/git/PullRequestDetail.tsx`
- Header: PR title, number, state badge, author, branch info (head → base)
- Stats bar: +additions / -deletions, changed files count, review status
- Body: rendered PR description (markdown-ish, or plain text)
- Action buttons: Merge (dropdown: squash/rebase/merge), Close, Approve, Request Changes
- All destructive buttons → confirmation dialog
- Below: diff viewer showing PR diff with inline review comments

#### Task 13.3.4: Wire PR diff into existing DiffViewer
- Extend `DiffViewer.tsx` to accept optional `reviewComments` prop
- Render comment threads at the appropriate line numbers
- Add clickable gutter for adding new review comments

**Validation:** Open PRs tab → see list of PRs. Click one → see diff with comments. Merge button shows confirmation.

---

### Phase 13.4: PR Create + Inline Review

**Goal:** Create PRs and submit code reviews from inside the editor.

#### Task 13.4.1: PullRequestCreate
- Create `src/renderer/components/git/PullRequestCreate.tsx`
- Form fields: title, body (textarea, pre-filled with template if detected), base branch (dropdown), head branch (current branch default)
- Optional fields: reviewers (multi-select from collaborators), labels (multi-select)
- Template detection: check `.github/pull_request_template.md` via `github:pr-template` IPC
- Submit button → `github:pr-create` → success toast + navigate to the new PR detail

#### Task 13.4.2: InlineReviewComment
- Create `src/renderer/components/git/InlineReviewComment.tsx`
- Comment thread component: shows existing comments at a line, "Reply" input
- "Add comment" component: appears when clicking diff gutter, text input + "Add to review" button
- Pending comments tracked in `github-store.pendingReviewComments[]`

#### Task 13.4.3: Review submission flow
- "Start Review" button in PR detail header
- Pending comments shown with yellow indicator
- "Submit Review" button: opens dialog with event selector (Approve / Request Changes / Comment) + summary text
- Submits all pending comments as a single review via `github:pr-review-submit`
- Clears pending comments on success

**Validation:** Create PR from current branch. Add inline comments. Submit review with approval. All work end-to-end.

---

### Phase 13.5: Issues Panel

**Goal:** Issues tab with list, detail, create, and comment.

#### Task 13.5.1: IssuesPanel
- Create `src/renderer/components/git/IssuesPanel.tsx`
- Filter bar: Open | Closed toggle, label filter dropdown, assignee filter
- Issue list items: number, title, labels (colored), assignee avatars, comment count, time ago
- Click → selects issue, loads detail in right panel
- "+ New Issue" button at top

#### Task 13.5.2: IssueDetail
- Create `src/renderer/components/git/IssueDetail.tsx`
- Header: title, number, state badge, author, created date
- Body: issue description
- Comments list: chronological, each with author + timestamp + body
- "Add Comment" input at bottom
- Action buttons: Close Issue / Reopen Issue (with confirmation), "Create Branch" (creates `issue-{number}-{slug}` branch)

#### Task 13.5.3: IssueCreate
- Create `src/renderer/components/git/IssueCreate.tsx`
- Form: title, body (textarea), labels (multi-select), assignees (multi-select)
- Submit → creates issue → navigates to detail view

**Validation:** Issues tab shows open issues. Click one → see comments. Create new issue. Close issue with confirmation. Create branch from issue.

---

### Phase 13.6: Integration Polish

**Goal:** Wire everything together, confirmation dialogs, error handling.

#### Task 13.6.1: Confirmation dialog integration
- All destructive actions use existing `useDialogStore.showDialog()`:
  - Merge PR: "Merge PR #X? This cannot be undone." + merge method selector
  - Close PR: "Close PR #X without merging?"
  - Close Issue: "Close issue #X?"
  - Approve PR: "Approve PR #X?"
  - Request Changes: "Request changes on PR #X?"

#### Task 13.6.2: Error handling
- gh CLI not found → GhCliSetup banner
- gh not authenticated → "Run `gh auth login` in your terminal" message
- Network errors → toast notification
- Rate limiting → show remaining rate limit info
- Repo not on GitHub → "This repository is not hosted on GitHub" message

#### Task 13.6.3: Loading states
- Skeleton loaders for PR list, issue list
- Spinner on detail view load
- Disabled buttons during async operations
- Optimistic updates where safe (e.g., comment appears immediately)

**Validation:** All error states handled gracefully. Confirmation dialogs work. Loading states visible.

## Acceptance Criteria

1. **gh CLI detection** — Shows setup prompt if not installed, works if installed + authed
2. **PR list** — Shows open PRs with filters, search, status badges
3. **PR detail** — Diff viewer with inline comments, PR metadata, merge/close actions
4. **PR create** — Form with template detection, branch picker, reviewer/label selection
5. **Inline review** — Line-level comments, batched review submission (approve/request changes/comment)
6. **Issue list** — Shows open issues with label/assignee filters
7. **Issue detail** — Comments, close/reopen, create branch from issue
8. **Issue create** — Form with labels and assignees
9. **Confirmation dialogs** — All destructive actions (merge, close, approve) require confirmation
10. **Error handling** — Network errors, auth errors, rate limits handled with user-facing messages
11. **Build passes** — `pnpm build` and `pnpm typecheck` succeed
12. **Tests pass** — E2E tests cover PR list, issue list, and gh CLI detection

## Validation Commands

```bash
cd C:/Projects/LiteEditor

# Type checking
pnpm build

# Run existing + new tests
pnpm test

# Dev mode smoke test
pnpm dev
```

## Assumptions Made

1. `gh` CLI is the sole GitHub backend — no direct REST API calls
2. `gh` CLI `--json` flag provides structured JSON output for all list/get operations
3. PR review comments use `gh api` for the REST endpoints that `gh pr` doesn't expose directly
4. Labels/milestones are pick-from-existing only (no CRUD for labels themselves)
5. No auto-polling — manual refresh button for PR/issue lists
6. PR merge strategies: squash, rebase, merge commit — user picks at merge time
7. PR templates detected from `.github/pull_request_template.md` (single template, not multiple)
8. Branch creation from issues uses format `issue-{number}-{title-slug}`
9. All destructive actions use existing `useDialogStore` confirmation system
10. Inline review comments are batched into a single review submission (GitHub's "Start a review" pattern)

## Notes

### Reference: gh CLI commands used

```bash
# PRs
gh pr list --json number,title,state,author,labels,reviewDecision,headRefName,baseRefName,additions,deletions,changedFiles,isDraft,updatedAt,createdAt --limit 50
gh pr view {number} --json number,title,body,state,author,labels,reviewDecision,headRefName,baseRefName,additions,deletions,changedFiles,isDraft,mergeable,updatedAt,createdAt,comments,reviewRequests
gh pr diff {number}
gh pr create --title "{title}" --body "{body}" --base {base} --head {head} [--reviewer {user}] [--label {label}]
gh pr merge {number} --squash|--rebase|--merge [--delete-branch]
gh pr close {number}
gh pr review {number} --approve|--request-changes|--comment --body "{body}"

# Issues
gh issue list --json number,title,state,author,labels,assignees,milestone,comments,createdAt,updatedAt --limit 50
gh issue view {number} --json number,title,body,state,author,labels,assignees,milestone,comments,createdAt,updatedAt
gh issue create --title "{title}" --body "{body}" [--label {label}] [--assignee {user}]
gh issue close {number}
gh issue reopen {number}
gh issue comment {number} --body "{body}"

# Helpers
gh repo view --json name,owner,defaultBranchRef
gh label list --json name,color
gh api repos/{owner}/{repo}/collaborators --jq '.[].login'
gh api repos/{owner}/{repo}/milestones --jq '.[].title'

# Reviews (via API)
gh api repos/{owner}/{repo}/pulls/{number}/reviews
gh api repos/{owner}/{repo}/pulls/{number}/comments
gh api -X POST repos/{owner}/{repo}/pulls/{number}/reviews -f body="{body}" -f event="APPROVE"
```

### Inspiration
- GitHub Desktop (PR list + create flow)
- Cursor's inline review annotations
- VS Code GitHub Pull Requests extension (review flow)
