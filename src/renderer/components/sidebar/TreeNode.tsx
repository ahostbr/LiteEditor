import React, { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { FileIcon } from '../shared/FileIcon'

export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

interface TreeNodeProps {
  node: FileNode
  depth: number
  onFileClick: (node: FileNode) => void
}

export function TreeNode({ node, depth, onFileClick }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 1)
  const [children, setChildren] = useState<FileNode[] | undefined>(node.children)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (node.isDirectory) {
      const opening = !isOpen
      setIsOpen(opening)
      // Lazy-load children if directory has no children loaded yet
      if (opening && !children) {
        setIsLoading(true)
        try {
          const loaded = await window.api.fs.readDir(node.path) as FileNode[]
          setChildren(loaded)
        } catch {
          setChildren([])
        } finally {
          setIsLoading(false)
        }
      }
    } else {
      onFileClick(node)
    }
  }

  // Sync children from parent when node.children changes (e.g. after tree refresh)
  const displayChildren = children ?? node.children

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
      {node.isDirectory && isOpen && displayChildren && (
        <div>
          {displayChildren.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
