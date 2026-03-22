import React, { useCallback, useEffect, useRef } from 'react'
import { Search, CaseSensitive, WholeWord, Regex, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useSearchStore, type SearchResult } from '../../stores/search-store'
import { useEditorStore } from '../../stores/editor-store'
import { openFileInCurrentMode } from '../../lib/open-file'
import { logError } from '../../stores/error-store'

export function SearchPanel() {
  const {
    query, setQuery, isRegex, toggleRegex, isCaseSensitive, toggleCaseSensitive,
    isWholeWord, toggleWholeWord, results, isSearching, executeSearch, selectResult, clearResults
  } = useSearchStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSearch = useCallback(() => {
    executeSearch()
  }, [executeSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') clearResults()
  }

  const handleResultClick = async (result: SearchResult, matchIndex: number) => {
    selectResult(result.file, matchIndex)
    const projectRoot = useEditorStore.getState().projectRoot
    if (!projectRoot) return
    const fullPath = `${projectRoot}/${result.file}`.replace(/\//g, '\\')
    try {
      await openFileInCurrentMode(fullPath)
    } catch (err) { logError('SearchPanel', `Failed to open search result: ${fullPath}`, err) }
  }

  const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0)

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Search
        </span>
      </div>
      <div className="px-3 py-2 shrink-0">
        <div className="flex items-center gap-1 rounded px-2 py-1" style={{ backgroundColor: 'var(--bg-overlay)' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button onClick={clearResults} className="p-0.5 hover:bg-[var(--bg-muted)] rounded" title="Clear Search">
              <X size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <ToggleBtn active={isRegex} onClick={toggleRegex} title="Use Regex">
            <Regex size={14} />
          </ToggleBtn>
          <ToggleBtn active={isCaseSensitive} onClick={toggleCaseSensitive} title="Case Sensitive">
            <CaseSensitive size={14} />
          </ToggleBtn>
          <ToggleBtn active={isWholeWord} onClick={toggleWholeWord} title="Whole Word">
            <WholeWord size={14} />
          </ToggleBtn>
          <button
            onClick={handleSearch}
            className="ml-auto px-2 py-0.5 text-xs rounded transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)'
            }}
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <div className="px-3 py-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Searching...
          </div>
        )}
        {!isSearching && results.length > 0 && (
          <div className="px-3 py-1">
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {totalMatches} results in {results.length} files
            </div>
            {results.map((result) => (
              <SearchResultGroup
                key={result.file}
                result={result}
                onMatchClick={(i) => handleResultClick(result, i)}
              />
            ))}
          </div>
        )}
        {!isSearching && results.length === 0 && query && (
          <div className="px-3 py-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            No results found
          </div>
        )}
      </div>
    </div>
  )
}

function ToggleBtn({ active, onClick, title, children }: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'p-1 rounded transition-colors',
        active
          ? 'bg-[var(--accent)] text-[var(--bg-base)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'
      )}
    >
      {children}
    </button>
  )
}

function SearchResultGroup({ result, onMatchClick }: {
  result: SearchResult
  onMatchClick: (index: number) => void
}) {
  return (
    <div className="mb-2">
      <div className="text-xs font-medium truncate py-0.5" style={{ color: 'var(--accent)' }}>
        {result.file}
      </div>
      {result.matches.slice(0, 20).map((match, i) => (
        <div
          key={i}
          onClick={() => onMatchClick(i)}
          className="flex items-start gap-2 py-0.5 px-1 cursor-pointer rounded hover:bg-[var(--bg-overlay)] transition-colors"
        >
          <span className="text-xs shrink-0 w-8 text-right" style={{ color: 'var(--text-muted)' }}>
            {match.line}
          </span>
          <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {match.lineContent}
          </span>
        </div>
      ))}
      {result.matches.length > 20 && (
        <div className="text-xs px-1 py-0.5" style={{ color: 'var(--text-muted)' }}>
          ... {result.matches.length - 20} more matches
        </div>
      )}
    </div>
  )
}
