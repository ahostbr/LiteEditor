import { useCallback, useEffect, useState, useRef } from 'react'
import { Plus, FolderOpen } from 'lucide-react'
import { useProjectStore, type ProjectState } from '../../stores/project-store'
import { useWorkspaceStore } from '../../stores/workspace-store'
import { useEditorStore } from '../../stores/editor-store'
import { logWarn } from '../../stores/error-store'
import { ProjectEntry } from './ProjectEntry'
import { WorkspaceCreateDialog } from './WorkspaceCreateDialog'
import { ProjectSettingsDialog } from './ProjectSettingsDialog'

export function ProjectSidebar() {
  const projects = useProjectStore((s) => s.projects)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const loaded = useProjectStore((s) => s.loaded)
  const addProject = useProjectStore((s) => s.addProject)
  const setActiveProject = useProjectStore((s) => s.setActiveProject)
  const reorderProjects = useProjectStore((s) => s.reorderProjects)
  const loadFromDisk = useProjectStore((s) => s.loadFromDisk)
  const [createDialogProjectId, setCreateDialogProjectId] = useState<string | null>(null)
  const [settingsProject, setSettingsProject] = useState<ProjectState | null>(null)

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)

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
    } catch (err) { logWarn('ProjectSidebar', 'Folder open cancelled or failed', err) }
  }, [addProject])

  const handleSelectProject = useCallback(async (id: string) => {
    if (id === activeProjectId) return

    // Save current workspace before switching
    try {
      await useWorkspaceStore.getState().saveCurrentWorkspace()
    } catch { /* ignore if no active workspace */ }

    await setActiveProject(id)
    const project = useProjectStore.getState().projects.find((p) => p.id === id)
    if (project) {
      useEditorStore.getState().setProjectRoot(project.rootPath)

      // Load workspaces and switch to last active
      await useWorkspaceStore.getState().loadWorkspacesForProject(id)
      if (project.lastActiveWorkspaceId) {
        await useWorkspaceStore.getState().switchWorkspace(project.lastActiveWorkspaceId)
      }
    }
  }, [activeProjectId, setActiveProject])

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
    // Set a transparent drag image
    const el = e.currentTarget as HTMLElement
    e.dataTransfer.setDragImage(el, 0, 0)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropIdx(idx)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx !== null && dragIdx !== idx) {
      // Map sorted indices back to original indices
      const fromProject = sortedProjects[dragIdx]
      const toProject = sortedProjects[idx]
      const fromOriginal = projects.indexOf(fromProject)
      const toOriginal = projects.indexOf(toProject)
      if (fromOriginal >= 0 && toOriginal >= 0) {
        reorderProjects(fromOriginal, toOriginal)
      }
    }
    setDragIdx(null)
    setDropIdx(null)
  }, [dragIdx, sortedProjects, projects, reorderProjects])

  const handleDragEnd = useCallback(() => {
    setDragIdx(null)
    setDropIdx(null)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 h-[30px] shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest opacity-80" style={{ color: 'var(--text-muted)' }}>
          Projects
        </span>
        <button
          onClick={handleAddProject}
          className="flex items-center justify-center w-5 h-5 rounded transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          title="Add Project"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-0.5">
        {sortedProjects.map((project, idx) => (
          <div
            key={project.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            style={{
              opacity: dragIdx === idx ? 0.5 : 1,
              borderTop: dropIdx === idx && dragIdx !== null && dragIdx > idx ? '2px solid var(--accent)' : '2px solid transparent',
              borderBottom: dropIdx === idx && dragIdx !== null && dragIdx < idx ? '2px solid var(--accent)' : undefined
            }}
          >
            <ProjectEntry
              project={project}
              isActive={project.id === activeProjectId}
              onSelect={() => handleSelectProject(project.id)}
              onCreateWorkspace={() => setCreateDialogProjectId(project.id)}
              onOpenSettings={() => setSettingsProject(project)}
            />
          </div>
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
