import React from 'react'
import { File, FileText, FileCode, FileJson, Image, FileType, Folder, FolderOpen } from 'lucide-react'

const EXT_ICON_MAP: Record<string, { icon: React.ReactNode; color: string }> = {
  '.ts': { icon: <FileCode size={16} />, color: '#3178c6' },
  '.tsx': { icon: <FileCode size={16} />, color: '#3178c6' },
  '.js': { icon: <FileCode size={16} />, color: '#f7df1e' },
  '.jsx': { icon: <FileCode size={16} />, color: '#f7df1e' },
  '.json': { icon: <FileJson size={16} />, color: '#a6e3a1' },
  '.html': { icon: <FileCode size={16} />, color: '#e34c26' },
  '.css': { icon: <FileCode size={16} />, color: '#563d7c' },
  '.scss': { icon: <FileCode size={16} />, color: '#c6538c' },
  '.md': { icon: <FileText size={16} />, color: '#7ca8cf' },
  '.py': { icon: <FileCode size={16} />, color: '#3572A5' },
  '.rs': { icon: <FileCode size={16} />, color: '#dea584' },
  '.go': { icon: <FileCode size={16} />, color: '#00ADD8' },
  '.java': { icon: <FileCode size={16} />, color: '#b07219' },
  '.c': { icon: <FileCode size={16} />, color: '#555555' },
  '.cpp': { icon: <FileCode size={16} />, color: '#f34b7d' },
  '.png': { icon: <Image size={16} />, color: '#a6e3a1' },
  '.jpg': { icon: <Image size={16} />, color: '#a6e3a1' },
  '.svg': { icon: <Image size={16} />, color: '#f9e2af' },
  '.gitignore': { icon: <FileType size={16} />, color: '#f38ba8' },
  '.env': { icon: <FileType size={16} />, color: '#f9e2af' }
}

export function FileIcon({
  name,
  isDirectory,
  isOpen
}: {
  name: string
  isDirectory?: boolean
  isOpen?: boolean
}) {
  if (isDirectory) {
    return isOpen
      ? <FolderOpen size={16} style={{ color: '#d4a039' }} />
      : <Folder size={16} style={{ color: '#d4a039' }} />
  }

  const ext = '.' + name.split('.').pop()?.toLowerCase()
  const mapping = EXT_ICON_MAP[ext] || EXT_ICON_MAP['.' + name.toLowerCase()]

  if (mapping) {
    return <span style={{ color: mapping.color }}>{mapping.icon}</span>
  }

  return <File size={16} style={{ color: 'var(--text-muted)' }} />
}
