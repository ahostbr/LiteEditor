import { create } from 'zustand'

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
  name: string
  ahead: number
  behind: number
}

export interface Branch {
  name: string
  current: boolean
  commit: string
  label: string
}

interface GitState {
  changedFiles: ChangedFile[]
  selectedFile: string | null
  selectedFileDiff: string | null
  currentBranch: BranchInfo | null
  branches: Branch[]
  commits: CommitInfo[]
  commitSummary: string
  commitDescription: string
  isLoading: boolean
  isPushing: boolean
  isPulling: boolean
  isFetching: boolean
  lastFetched: Date | null

  refreshStatus: () => Promise<void>
  selectFile: (path: string) => Promise<void>
  toggleStaged: (path: string) => Promise<void>
  stageAll: () => Promise<void>
  unstageAll: () => Promise<void>
  setCommitSummary: (s: string) => void
  setCommitDescription: (s: string) => void
  createCommit: () => Promise<void>
  pushOrigin: () => Promise<void>
  pullOrigin: () => Promise<void>
  fetchOrigin: () => Promise<void>
  loadBranches: () => Promise<void>
  switchBranch: (name: string) => Promise<void>
  createBranch: (name: string) => Promise<void>
  deleteBranch: (name: string) => Promise<void>
  loadHistory: (limit?: number) => Promise<void>
  discardChanges: (path: string) => Promise<void>
}

export const useGitStore = create<GitState>((set, get) => ({
  changedFiles: [],
  selectedFile: null,
  selectedFileDiff: null,
  currentBranch: null,
  branches: [],
  commits: [],
  commitSummary: '',
  commitDescription: '',
  isLoading: false,
  isPushing: false,
  isPulling: false,
  isFetching: false,
  lastFetched: null,

  refreshStatus: async () => {
    set({ isLoading: true })
    try {
      const files = await window.api.git.status() as ChangedFile[]
      const branch = await window.api.git.currentBranch() as BranchInfo
      set({ changedFiles: files, currentBranch: branch })
    } catch {
      // Not a git repo or other error
    } finally {
      set({ isLoading: false })
    }
  },

  selectFile: async (path) => {
    set({ selectedFile: path })
    try {
      const diff = await window.api.git.diff(path)
      set({ selectedFileDiff: diff })
    } catch {
      set({ selectedFileDiff: null })
    }
  },

  toggleStaged: async (path) => {
    const file = get().changedFiles.find((f) => f.path === path)
    if (!file) return
    try {
      if (file.staged) {
        await window.api.git.unstage(path)
      } else {
        await window.api.git.stage(path)
      }
      await get().refreshStatus()
    } catch { /* ignore */ }
  },

  stageAll: async () => {
    try {
      await window.api.git.stageAll()
      await get().refreshStatus()
    } catch { /* ignore */ }
  },

  unstageAll: async () => {
    try {
      await window.api.git.unstageAll()
      await get().refreshStatus()
    } catch { /* ignore */ }
  },

  setCommitSummary: (s) => set({ commitSummary: s }),
  setCommitDescription: (s) => set({ commitDescription: s }),

  createCommit: async () => {
    const { commitSummary, commitDescription } = get()
    if (!commitSummary.trim()) return
    try {
      await window.api.git.commit(commitSummary, commitDescription || undefined)
      set({ commitSummary: '', commitDescription: '' })
      await get().refreshStatus()
    } catch { /* ignore */ }
  },

  pushOrigin: async () => {
    set({ isPushing: true })
    try {
      await window.api.git.push()
      await get().refreshStatus()
    } catch { /* ignore */ }
    finally { set({ isPushing: false }) }
  },

  pullOrigin: async () => {
    set({ isPulling: true })
    try {
      await window.api.git.pull()
      await get().refreshStatus()
    } catch { /* ignore */ }
    finally { set({ isPulling: false }) }
  },

  fetchOrigin: async () => {
    set({ isFetching: true })
    try {
      await window.api.git.fetch()
      set({ lastFetched: new Date() })
      await get().refreshStatus()
    } catch { /* ignore */ }
    finally { set({ isFetching: false }) }
  },

  loadBranches: async () => {
    try {
      const result = await window.api.git.branches() as unknown as { current: string; branches: Branch[] }
      set({ branches: result.branches })
    } catch { /* ignore */ }
  },

  switchBranch: async (name) => {
    try {
      await window.api.git.checkout(name)
      await get().refreshStatus()
      await get().loadBranches()
    } catch { /* ignore */ }
  },

  createBranch: async (name) => {
    try {
      await window.api.git.createBranch(name)
      await get().refreshStatus()
      await get().loadBranches()
    } catch { /* ignore */ }
  },

  deleteBranch: async (name) => {
    try {
      await window.api.git.deleteBranch(name)
      await get().loadBranches()
    } catch { /* ignore */ }
  },

  loadHistory: async (limit = 50) => {
    try {
      const commits = await window.api.git.log(limit) as CommitInfo[]
      set({ commits })
    } catch { /* ignore */ }
  },

  discardChanges: async (path) => {
    try {
      await window.api.git.discardChanges(path)
      await get().refreshStatus()
    } catch { /* ignore */ }
  }
}))
