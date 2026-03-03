import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { FileIcon } from '../shared/FileIcon'

export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

export interface RefreshSignal {
  dirPath: string
  counter: number
}

interface TreeNodeProps {
  node: FileNode
  depth: number
  onFileClick: (node: FileNode) => void
  refreshSignal: RefreshSignal
}

export function TreeNode({ node, depth, onFileClick, refreshSignal }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [children, setChildren] = useState<FileNode[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  // Watch/unwatch directory when expanded/collapsed
  useEffect(() => {
    if (node.isDirectory && isOpen) {
      window.api.fs.watchDir(node.path)
      return () => {
        window.api.fs.unwatchDir(node.path)
      }
    }
  }, [isOpen, node.path, node.isDirectory])

  // Re-fetch children when a change occurs in this directory
  useEffect(() => {
    if (refreshSignal.counter > 0 && isOpen && children && refreshSignal.dirPath === node.path) {
      window.api.fs.readDir(node.path).then((loaded) => {
        if (mountedRef.current) setChildren(loaded as FileNode[])
      }).catch(() => {
        if (mountedRef.current) setChildren([])
      })
    }
  }, [refreshSignal.counter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = async () => {
    if (node.isDirectory) {
      const opening = !isOpen
      setIsOpen(opening)
      // Lazy-load children if directory has no children loaded yet
      if (opening && !children) {
        setIsLoading(true)
        try {
          const loaded = await window.api.fs.readDir(node.path) as FileNode[]
          if (mountedRef.current) setChildren(loaded)
        } catch {
          if (mountedRef.current) setChildren([])
        } finally {
          if (mountedRef.current) setIsLoading(false)
        }
      }
    } else {
      onFileClick(node)
    }
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1 py-0.5 pr-2 cursor-pointer transition-colors',
          'hover:bg-[var(--bg-overlay)]'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.isDirectory ? (
          <span className="w-4 h-4 flex items-center justify-center shrink-0" style={{ color: 'var(--text-muted)' }}>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}
        <FileIcon name={node.name} isDirectory={node.isDirectory} isOpen={isOpen} />
        <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {node.name}
        </span>
        {isLoading && (
          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>...</span>
        )}
      </div>
      {node.isDirectory && isOpen && children && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              refreshSignal={refreshSignal}
            />
          ))}
        </div>
      )}
    </div>
  )
}
