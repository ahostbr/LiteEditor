import { useCallback, useEffect, useState } from 'react'
import { Plus, FolderOpen } from 'lucide-react'
import { useProjectStore, type ProjectState } from '../../stores/project-store'
import { useEditorStore } from '../../stores/editor-store'
import { ProjectEntry } from './ProjectEntry'
import { WorkspaceCreateDialog } from './WorkspaceCreateDialog'
import { ProjectSettingsDialog } from './ProjectSettingsDialog'

export function ProjectSidebar() {
  const projects = useProjectStore((s) => s.projects)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const loaded = useProjectStore((s) => s.loaded)
  const addProject = useProjectStore((s) => s.addProject)
  const setActiveProject = useProjectStore((s) => s.setActiveProject)
  const loadFromDisk = useProjectStore((s) => s.loadFromDisk)
  const [createDialogProjectId, setCreateDialogProjectId] = useState<string | null>(null)
  const [settingsProject, setSettingsProject] = useState<ProjectState | null>(null)

  // Load projects from disk on mount
  useEffect(() => {
    if (!loaded) {
      loadFromDisk()
    }
  }, [loaded, loadFromDisk])

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
        await addProject(path)
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
        className="flex items-center justify-between px-3 h-[30px] shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Projects
        </span>
        <button
          onClick={handleAddProject}
          className="flex items-center justify-center w-5 h-5 rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          title="Add Project"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-0.5">
        {sortedProjects.map((project) => (
          <ProjectEntry
            key={project.id}
            project={project}
            isActive={project.id === activeProjectId}
            onSelect={() => handleSelectProject(project.id)}
            onCreateWorkspace={() => setCreateDialogProjectId(project.id)}
            onOpenSettings={() => setSettingsProject(project)}
          />
        ))}

        {projects.length === 0 && (
          <button
            onClick={handleAddProject}
            className="flex flex-col items-center gap-1.5 w-full py-6 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <FolderOpen size={20} />
            <span className="text-[10px]">Open a project folder</span>
          </button>
        )}
      </div>

      {/* Workspace create dialog */}
      {createDialogProjectId && (
        <WorkspaceCreateDialog
          projectId={createDialogProjectId}
          onClose={() => setCreateDialogProjectId(null)}
        />
      )}

      {/* Project settings dialog */}
      {settingsProject && (
        <ProjectSettingsDialog
          project={settingsProject}
          onClose={() => setSettingsProject(null)}
        />
      )}
    </div>
  )
}
