import React, { useEffect, useState, useCallback, useRef } from 'react'
import { RefreshCw, FolderOpen } from 'lucide-react'
import { TreeNode, type FileNode, type RefreshSignal } from './TreeNode'
import { useEditorStore } from '../../stores/editor-store'
import { useUiStore } from '../../stores/ui-store'
import { useZenStore } from '../../stores/zen-store'

export function FileExplorer() {
  const [tree, setTree] = useState<FileNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState<RefreshSignal>({ dirPath: '', counter: 0 })
  const projectRoot = useEditorStore((s) => s.projectRoot)
  const setProjectRoot = useEditorStore((s) => s.setProjectRoot)
  const openFile = useEditorStore((s) => s.openFile)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadTree = useCallback(async () => {
    if (!projectRoot) return
    setIsLoading(true)
    try {
      const nodes = await window.api.fs.readTree(projectRoot, 2) as FileNode[]
      setTree(nodes)
    } catch {
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
      try { await window.api.git.init(path) } catch { /* not a git repo */ }
      try { await window.api.search.setRoot(path) } catch { /* ignore */ }
    }
  }

  const handleFileClick = async (node: FileNode) => {
    if (node.isDirectory) return
    try {
      const content = await window.api.fs.readFile(node.path)
      const appMode = useUiStore.getState().appMode
      if (appMode === 'zen') {
        useZenStore.getState().addEditorPanel(node.path, content)
      } else {
        openFile(node.path, content)
      }
    } catch { /* ignore */ }
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
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Explorer
        </span>
        <button
          onClick={loadTree}
          className="p-1 rounded hover:bg-[var(--bg-overlay)] transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="Refresh"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
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
