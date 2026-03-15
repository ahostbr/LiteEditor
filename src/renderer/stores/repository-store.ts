import { create } from 'zustand'
import type { ChangedFile, FileDiff, Commit, FileStatus, RepositoryTab } from '../types/repository'
import { parseDiff } from '../lib/diff-parser'

function parseStatusChar(c: string): FileStatus {
  switch (c) {
    case 'A': return 'added'
    case 'M': return 'modified'
    case 'D': return 'deleted'
    case 'R': return 'renamed'
    case 'C': return 'copied'
    case '?': return 'untracked'
    case 'U': return 'conflicted'
    case '!': return 'ignored'
    default: return 'modified'
  }
}

interface RepositoryState {
  repoPath: string | null
  activeTab: RepositoryTab
  isLoading: boolean

  // Changes tab
  changedFiles: ChangedFile[]
  selectedFile: string | null
  selectedDiff: FileDiff | null
  commitSummary: string
  commitDescription: string

  // History tab
  commits: Commit[]
  selectedCommit: string | null

  // Branch info
  currentBranch: string
  ahead: number
  behind: number

  // Polling
  pollIntervalId: ReturnType<typeof setInterval> | null

  // Actions
  initialize: (repoPath: string) => Promise<void>
  shutdown: () => void
  setActiveTab: (tab: RepositoryTab) => void
  refreshStatus: () => Promise<void>
  selectFile: (path: string | null) => Promise<void>
  stageFile: (path: string) => Promise<void>
  unstageFile: (path: string) => Promise<void>
  stageAll: () => Promise<void>
  unstageAll: () => Promise<void>
  discardFileChanges: (path: string) => Promise<void>
  createCommit: () => Promise<void>
  setCommitSummary: (summary: string) => void
  setCommitDescription: (description: string) => void
  fetchOrigin: () => Promise<void>
  pushOrigin: () => Promise<void>
  pullOrigin: () => Promise<void>
  loadHistory: () => Promise<void>
  selectCommit: (hash: string | null) => void
}

export const useRepositoryStore = create<RepositoryState>((set, get) => ({
  repoPath: null,
  activeTab: 'changes',
  isLoading: false,
  changedFiles: [],
  selectedFile: null,
  selectedDiff: null,
  commitSummary: '',
  commitDescription: '',
  commits: [],
  selectedCommit: null,
  currentBranch: '',
  ahead: 0,
  behind: 0,
  pollIntervalId: null,

  initialize: async (repoPath) => {
    const prev = get()
    if (prev.pollIntervalId) clearInterval(prev.pollIntervalId)

    set({ repoPath, isLoading: true })

    try {
      await window.api.git.init(repoPath)
      await get().refreshStatus()

      // Start polling every 10 seconds
      const intervalId = setInterval(() => {
        get().refreshStatus()
      }, 10000)
      set({ pollIntervalId: intervalId })
    } catch (e) {
      console.error('Failed to initialize git repo:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  shutdown: () => {
    const { pollIntervalId } = get()
    if (pollIntervalId) clearInterval(pollIntervalId)
    set({ pollIntervalId: null, repoPath: null })
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab })
    if (tab === 'history' && get().commits.length === 0) {
      get().loadHistory()
    }
  },

  refreshStatus: async () => {
    try {
      const files = (await window.api.git.status()) as Array<{ path: string; status: string; staged: boolean }>
      const changedFiles: ChangedFile[] = files.map((f) => ({
        path: f.path,
        status: parseStatusChar(f.status),
        staged: f.staged
      }))
      set({ changedFiles })

      const branch = (await window.api.git.currentBranch()) as { name: string; ahead: number; behind: number }
      set({
        currentBranch: branch.name,
        ahead: branch.ahead,
        behind: branch.behind
      })
    } catch {
      // Not a git repo or git error
    }
  },

  selectFile: async (path) => {
    set({ selectedFile: path, selectedDiff: null })
    if (!path) return

    try {
      const file = get().changedFiles.find((f) => f.path === path)
      const diffText = file?.staged
        ? await window.api.git.diffCached(path)
        : await window.api.git.diff(path)
      const diff = parseDiff(diffText)
      set({ selectedDiff: { ...diff, path } })
    } catch {
      set({ selectedDiff: null })
    }
  },

  stageFile: async (path) => {
    await window.api.git.stage(path)
    await get().refreshStatus()
    // Re-select to refresh diff
    if (get().selectedFile === path) {
      await get().selectFile(path)
    }
  },

  unstageFile: async (path) => {
    await window.api.git.unstage(path)
    await get().refreshStatus()
    if (get().selectedFile === path) {
      await get().selectFile(path)
    }
  },

  stageAll: async () => {
    await window.api.git.stageAll()
    await get().refreshStatus()
  },

  unstageAll: async () => {
    await window.api.git.unstageAll()
    await get().refreshStatus()
  },

  discardFileChanges: async (path) => {
    await window.api.git.discardChanges(path)
    await get().refreshStatus()
    if (get().selectedFile === path) {
      set({ selectedFile: null, selectedDiff: null })
    }
  },

  createCommit: async () => {
    const { commitSummary, commitDescription } = get()
    if (!commitSummary.trim()) return
    await window.api.git.commit(commitSummary.trim(), commitDescription.trim() || undefined)
    set({ commitSummary: '', commitDescription: '' })
    await get().refreshStatus()
    // Refresh history if on that tab
    if (get().activeTab === 'history') {
      await get().loadHistory()
    }
  },

  setCommitSummary: (summary) => set({ commitSummary: summary }),
  setCommitDescription: (description) => set({ commitDescription: description }),

  fetchOrigin: async () => {
    await window.api.git.fetch()
    await get().refreshStatus()
  },

  pushOrigin: async () => {
    await window.api.git.push()
    await get().refreshStatus()
  },

  pullOrigin: async () => {
    await window.api.git.pull()
    await get().refreshStatus()
  },

  loadHistory: async () => {
    try {
      const commits = (await window.api.git.log(100)) as Array<{
        hash: string; date: string; message: string; author_name: string; author_email: string
      }>
      set({
        commits: commits.map((c) => ({
          hash: c.hash,
          shortHash: c.hash.slice(0, 7),
          date: c.date,
          message: c.message,
          authorName: c.author_name,
          authorEmail: c.author_email
        }))
      })
    } catch {
      set({ commits: [] })
    }
  },

  selectCommit: (hash) => set({ selectedCommit: hash })
}))
