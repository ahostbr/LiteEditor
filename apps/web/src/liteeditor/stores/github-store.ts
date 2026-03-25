// @ts-nocheck
import { create } from "zustand";
import type {
  PullRequest,
  Issue,
  IssueComment,
  Review,
  ReviewComment,
  PendingReviewComment,
  PrFilter,
  IssueFilter,
  GitHubLabel,
} from "../types/github";
import { parseDiff } from "../lib/diff-parser";
import type { FileDiff } from "../types/repository";
import { logWarn } from "./error-store";

interface GitHubState {
  // CLI status
  ghCliReady: boolean;
  ghCliInstalled: boolean;
  ghCliAuthenticated: boolean;

  // PRs
  pullRequests: PullRequest[];
  selectedPrNumber: number | null;
  prDetail: PullRequest | null;
  prDiff: FileDiff[] | null;
  prReviews: Review[];
  prReviewComments: ReviewComment[];
  prFilter: PrFilter;
  pendingReviewComments: PendingReviewComment[];

  // Issues
  issues: Issue[];
  selectedIssueNumber: number | null;
  issueDetail: Issue | null;
  issueComments: IssueComment[];
  issueFilter: IssueFilter;

  // Helpers
  labels: GitHubLabel[];
  collaborators: string[];

  // Loading
  isLoading: boolean;
  error: string | null;

  // Actions
  checkGhCli: () => Promise<void>;
  installGhCli: () => Promise<{ success: boolean; error?: string }>;
  initForRepo: (cwd: string) => Promise<void>;

  // PR actions
  loadPullRequests: (filter?: PrFilter) => Promise<void>;
  selectPullRequest: (number: number | null) => Promise<void>;
  createPullRequest: (
    title: string,
    body: string,
    base: string,
    head: string,
    reviewers?: string[],
    labels?: string[],
  ) => Promise<PullRequest>;
  mergePullRequest: (number: number, method: "squash" | "rebase" | "merge") => Promise<void>;
  closePullRequest: (number: number) => Promise<void>;
  addPendingReviewComment: (path: string, line: number, body: string) => void;
  removePendingReviewComment: (index: number) => void;
  submitReview: (
    prNumber: number,
    event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
    body: string,
  ) => Promise<void>;

  // Issue actions
  loadIssues: (filter?: IssueFilter) => Promise<void>;
  selectIssue: (number: number | null) => Promise<void>;
  createIssue: (
    title: string,
    body: string,
    labels?: string[],
    assignees?: string[],
  ) => Promise<Issue>;
  commentOnIssue: (number: number, body: string) => Promise<void>;
  closeIssue: (number: number) => Promise<void>;
  reopenIssue: (number: number) => Promise<void>;
  createBranchFromIssue: (number: number, title: string) => Promise<void>;

  // Helpers
  loadLabels: () => Promise<void>;
  loadCollaborators: () => Promise<void>;
  loadPrTemplate: () => Promise<string | null>;
}

function parseMultiFileDiff(diffText: string): FileDiff[] {
  // Split on diff headers
  const parts = diffText.split(/(?=^diff --git )/m).filter(Boolean);
  return parts.map((part) => parseDiff(part));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export const useGitHubStore = create<GitHubState>((set, get) => ({
  ghCliReady: false,
  ghCliInstalled: false,
  ghCliAuthenticated: false,
  pullRequests: [],
  selectedPrNumber: null,
  prDetail: null,
  prDiff: null,
  prReviews: [],
  prReviewComments: [],
  prFilter: "open",
  pendingReviewComments: [],
  issues: [],
  selectedIssueNumber: null,
  issueDetail: null,
  issueComments: [],
  issueFilter: "open",
  labels: [],
  collaborators: [],
  isLoading: false,
  error: null,

  checkGhCli: async () => {
    try {
      const result = (await window.api.github.checkCli()) as {
        installed: boolean;
        authenticated: boolean;
      };
      set({
        ghCliInstalled: result.installed,
        ghCliAuthenticated: result.authenticated,
        ghCliReady: result.installed && result.authenticated,
      });
    } catch (err) {
      logWarn("github", "GitHub CLI check failed", err);
      set({ ghCliInstalled: false, ghCliAuthenticated: false, ghCliReady: false });
    }
  },

  installGhCli: async () => {
    const result = (await window.api.github.installCli()) as { success: boolean; error?: string };
    if (result.success) {
      await get().checkGhCli();
    }
    return result;
  },

  initForRepo: async (cwd) => {
    await window.api.github.setCwd(cwd);
    await get().checkGhCli();
  },

  // ── PRs ──

  loadPullRequests: async (filter) => {
    const f = filter || get().prFilter;
    set({ isLoading: true, prFilter: f, error: null });
    try {
      const prs = (await window.api.github.prList(f)) as PullRequest[];
      set({ pullRequests: prs });
    } catch (e) {
      set({ error: String(e), pullRequests: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  selectPullRequest: async (number) => {
    if (number === null) {
      set({
        selectedPrNumber: null,
        prDetail: null,
        prDiff: null,
        prReviews: [],
        prReviewComments: [],
      });
      return;
    }
    set({ selectedPrNumber: number, isLoading: true });
    try {
      const [detail, diffText, reviews, comments] = await Promise.all([
        window.api.github.prGet(number) as Promise<PullRequest>,
        window.api.github.prDiff(number),
        window.api.github.prReviews(number) as Promise<Review[]>,
        window.api.github.prReviewComments(number) as Promise<ReviewComment[]>,
      ]);
      set({
        prDetail: detail,
        prDiff: parseMultiFileDiff(diffText),
        prReviews: reviews,
        prReviewComments: comments,
      });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  createPullRequest: async (title, body, base, head, reviewers, labels) => {
    const pr = (await window.api.github.prCreate(
      title,
      body,
      base,
      head,
      reviewers,
      labels,
    )) as PullRequest;
    await get().loadPullRequests();
    return pr;
  },

  mergePullRequest: async (number, method) => {
    await window.api.github.prMerge(number, method);
    await get().loadPullRequests();
    set({ selectedPrNumber: null, prDetail: null, prDiff: null });
  },

  closePullRequest: async (number) => {
    await window.api.github.prClose(number);
    await get().loadPullRequests();
    set({ selectedPrNumber: null, prDetail: null, prDiff: null });
  },

  addPendingReviewComment: (path, line, body) => {
    set((s) => ({
      pendingReviewComments: [...s.pendingReviewComments, { path, line, side: "RIGHT", body }],
    }));
  },

  removePendingReviewComment: (index) => {
    set((s) => ({
      pendingReviewComments: s.pendingReviewComments.filter((_, i) => i !== index),
    }));
  },

  submitReview: async (prNumber, event, body) => {
    const { pendingReviewComments } = get();
    const comments =
      pendingReviewComments.length > 0
        ? pendingReviewComments.map((c) => ({ path: c.path, line: c.line, body: c.body }))
        : undefined;
    await window.api.github.prReviewSubmit(prNumber, event, body, comments);
    set({ pendingReviewComments: [] });
    // Reload reviews
    await get().selectPullRequest(prNumber);
  },

  // ── Issues ──

  loadIssues: async (filter) => {
    const f = filter || get().issueFilter;
    set({ isLoading: true, issueFilter: f, error: null });
    try {
      const issues = (await window.api.github.issueList(f)) as Issue[];
      set({ issues });
    } catch (e) {
      set({ error: String(e), issues: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  selectIssue: async (number) => {
    if (number === null) {
      set({ selectedIssueNumber: null, issueDetail: null, issueComments: [] });
      return;
    }
    set({ selectedIssueNumber: number, isLoading: true });
    try {
      const [detail, comments] = await Promise.all([
        window.api.github.issueGet(number) as Promise<Issue>,
        window.api.github.issueComments(number) as Promise<IssueComment[]>,
      ]);
      set({ issueDetail: detail, issueComments: comments });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  createIssue: async (title, body, labels, assignees) => {
    const issue = (await window.api.github.issueCreate(title, body, labels, assignees)) as Issue;
    await get().loadIssues();
    return issue;
  },

  commentOnIssue: async (number, body) => {
    await window.api.github.issueComment(number, body);
    await get().selectIssue(number);
  },

  closeIssue: async (number) => {
    await window.api.github.issueClose(number);
    await get().loadIssues();
    set({ selectedIssueNumber: null, issueDetail: null });
  },

  reopenIssue: async (number) => {
    await window.api.github.issueReopen(number);
    await get().selectIssue(number);
  },

  createBranchFromIssue: async (number, title) => {
    const branchName = `issue-${number}-${slugify(title)}`;
    await window.api.git.createBranch(branchName);
  },

  // ── Helpers ──

  loadLabels: async () => {
    try {
      const labels = (await window.api.github.labelsList()) as GitHubLabel[];
      set({ labels });
    } catch (err) {
      logWarn("github", "Failed to load labels", err);
    }
  },

  loadCollaborators: async () => {
    try {
      const collaborators = await window.api.github.collaboratorsList();
      set({ collaborators });
    } catch (err) {
      logWarn("github", "Failed to load collaborators", err);
    }
  },

  loadPrTemplate: async () => {
    return await window.api.github.prTemplate();
  },
}));
