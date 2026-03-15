export interface GitHubUser {
  login: string
  avatarUrl?: string
}

export interface GitHubLabel {
  name: string
  color: string
}

export interface PullRequest {
  number: number
  title: string
  body: string
  state: 'OPEN' | 'CLOSED' | 'MERGED'
  author: GitHubUser
  labels: GitHubLabel[]
  reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null
  headRefName: string
  baseRefName: string
  additions: number
  deletions: number
  changedFiles: number
  isDraft: boolean
  mergeable: string
  updatedAt: string
  createdAt: string
  comments: { totalCount: number }
  reviewRequests: Array<{ login: string }>
  url: string
}

export interface ReviewComment {
  id: number
  body: string
  path: string
  line: number | null
  side: 'LEFT' | 'RIGHT'
  author: GitHubUser
  createdAt: string
  inReplyToId?: number
}

export interface Review {
  id: number
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'PENDING' | 'DISMISSED'
  body: string
  author: GitHubUser
  submittedAt: string
}

export interface PendingReviewComment {
  path: string
  line: number
  side: 'RIGHT'
  body: string
}

export interface Issue {
  number: number
  title: string
  body: string
  state: string
  author: GitHubUser
  labels: GitHubLabel[]
  assignees: GitHubUser[]
  milestone: { title: string } | null
  comments: { totalCount: number }
  createdAt: string
  updatedAt: string
  url: string
}

export interface IssueComment {
  id: string
  body: string
  author: GitHubUser
  createdAt: string
}

export type PrFilter = 'open' | 'closed' | 'all'
export type IssueFilter = 'open' | 'closed' | 'all'
