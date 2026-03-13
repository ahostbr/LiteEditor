import { useCallback } from 'react'
import { Plus, FolderOpen } from 'lucide-react'
import { useProjectStore } from '../../stores/project-store'
import { useEditorStore } from '../../stores/editor-store'
import { ProjectEntry } from './ProjectEntry'

export function ProjectSidebar() {
  const projects = useProjectStore((s) => s.projects)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const addProject = useProjectStore((s) => s.addProject)
  const setActiveProject = useProjectStore((s) => s.setActiveProject)

  // Sort: pinned first, then by last activity
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.lastActivity - a.lastActivity
  })

  const handleAddProject = useCallback(async () => {
    try {
      const path = await window.api.dialog.openFolder()
      if (path) {
        const id = addProject(path)
        // Also set as project root for file explorer / git
        useEditorStore.getState().setProjectRoot(path)
      }
    } catch { /* ignore */ }
  }, [addProject])

  const handleSelectProject = useCallback((id: string) => {
    setActiveProject(id)
    const project = useProjectStore.getState().projects.find((p) => p.id === id)
    if (project) {
      useEditorStore.getState().setProjectRoot(project.rootPath)
    }
  }, [setActiveProject])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-[36px] shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Projects
        </span>
        <button
          onClick={handleAddProject}
          className="flex items-center justify-center w-6 h-6 rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          title="Add Project"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-1">
        {sortedProjects.map((project) => (
          <ProjectEntry
            key={project.id}
            project={project}
            isActive={project.id === activeProjectId}
            onSelect={() => handleSelectProject(project.id)}
          />
        ))}

        {projects.length === 0 && (
          <button
            onClick={handleAddProject}
            className="flex flex-col items-center gap-2 w-full py-8 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <FolderOpen size={24} />
            <span className="text-xs">Open a project folder</span>
          </button>
        )}
      </div>
    </div>
  )
}
