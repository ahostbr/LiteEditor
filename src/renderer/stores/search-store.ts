import { create } from 'zustand'
import { logError } from './error-store'

export interface SearchMatch {
  line: number
  col: number
  text: string
  lineContent: string
}

export interface SearchResult {
  file: string
  matches: SearchMatch[]
}

interface SearchState {
  query: string
  isRegex: boolean
  isCaseSensitive: boolean
  isWholeWord: boolean
  results: SearchResult[]
  isSearching: boolean
  selectedResult: { file: string; matchIndex: number } | null

  setQuery: (q: string) => void
  toggleRegex: () => void
  toggleCaseSensitive: () => void
  toggleWholeWord: () => void
  executeSearch: () => Promise<void>
  selectResult: (file: string, matchIndex: number) => void
  clearResults: () => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  isRegex: false,
  isCaseSensitive: false,
  isWholeWord: false,
  results: [],
  isSearching: false,
  selectedResult: null,

  setQuery: (q) => set({ query: q }),
  toggleRegex: () => set((s) => ({ isRegex: !s.isRegex })),
  toggleCaseSensitive: () => set((s) => ({ isCaseSensitive: !s.isCaseSensitive })),
  toggleWholeWord: () => set((s) => ({ isWholeWord: !s.isWholeWord })),

  executeSearch: async () => {
    const { query, isRegex, isCaseSensitive, isWholeWord } = get()
    if (!query.trim()) {
      set({ results: [], isSearching: false })
      return
    }

    set({ isSearching: true })
    try {
      const results = await window.api.search.searchFiles(query, {
        regex: isRegex,
        caseSensitive: isCaseSensitive,
        wholeWord: isWholeWord
      }) as SearchResult[]
      set({ results, isSearching: false })
    } catch (err) {
      logError('search', 'Failed to execute search', err)
      set({ results: [], isSearching: false })
    }
  },

  selectResult: (file, matchIndex) => set({ selectedResult: { file, matchIndex } }),
  clearResults: () => set({ results: [], query: '', selectedResult: null })
}))
