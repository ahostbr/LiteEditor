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

  const handleClick = () => {
    if (node.isDirectory) {
      setIsOpen(!isOpen)
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
      </div>
      {node.isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
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
