import React, { useEffect, useState, useCallback, useRef } from 'react'
import { RefreshCw, FolderOpen } from 'lucide-react'
import { TreeNode, type FileNode, type RefreshSignal } from './TreeNode'
import { useEditorStore } from '../../stores/editor-store'
import { openFileInCurrentMode } from '../../lib/open-file'
import { logWarn, logError } from '../../stores/error-store'

export function FileExplorer() {
  const [tree, setTree] = useState<FileNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState<RefreshSignal>({ dirPath: '', counter: 0 })
  const projectRoot = useEditorStore((s) => s.projectRoot)
  const setProjectRoot = useEditorStore((s) => s.setProjectRoot)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadTree = useCallback(async () => {
    if (!projectRoot) return
    setIsLoading(true)
    try {
      const nodes = await window.api.fs.readTree(projectRoot, 2) as FileNode[]
      setTree(nodes)
    } catch (err) {
      logError('FileExplorer', 'Failed to read file tree', err)
      setTree([])
    } finally {
      setIsLoading(false)
    }
  }, [projectRoot])

  useEffect(() => {
    loadTree()
  }, [loadTree])

  useEffect(() => {
    if (!projectRoot) return
    // Only watch the root directory (non-recursive); subdirectories are watched on expand
    window.api.fs.watchStart(projectRoot)
    const unsub = window.api.fs.onFileChange((_event, filePath) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        // Determine which directory was affected
        const lastSep = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
        const parentDir = lastSep > 0 ? filePath.substring(0, lastSep) : filePath

        // If the root directory itself changed, re-fetch the root tree
        if (parentDir === projectRoot) {
          loadTree()
        }

        // Signal the affected directory so expanded TreeNodes can refresh
        setRefreshSignal(prev => ({ dirPath: parentDir, counter: prev.counter + 1 }))
      }, 300)
    })
    return () => {
      unsub()
      window.api.fs.watchStop()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [projectRoot, loadTree])

  const handleOpenFolder = async () => {
    const path = await window.api.dialog.openFolder()
    if (path) {
      setProjectRoot(path)
      try { await window.api.git.init(path) } catch (err) { logWarn('FileExplorer', 'Git init skipped (not a git repo)', err) }
      try { await window.api.search.setRoot(path) } catch (err) { logWarn('FileExplorer', 'Failed to set search root', err) }
    }
  }

  const handleFileClick = async (node: FileNode) => {
    if (node.isDirectory) return
    try {
      await openFileInCurrentMode(node.path)
    } catch (err) { logError('FileExplorer', `Failed to open file: ${node.path}`, err) }
  }

  if (!projectRoot) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          No folder opened
        </p>
        <button
          onClick={handleOpenFolder}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-base)'
          }}
        >
          <FolderOpen size={16} />
          Open Folder
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-3 h-[30px] shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest opacity-80" style={{ color: 'var(--text-muted)' }}>
          Explorer
        </span>
        <button
          onClick={loadTree}
          className="flex items-center justify-center w-5 h-5 rounded transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          title="Refresh"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            onFileClick={handleFileClick}
            refreshSignal={refreshSignal}
          />
        ))}
      </div>
    </div>
  )
}
