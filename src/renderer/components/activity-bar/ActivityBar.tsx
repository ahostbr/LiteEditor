import React from 'react'
import { Files, Search, GitBranch, Settings, Terminal, LayoutGrid, FolderKanban } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useUiStore, type SidebarPanel } from '../../stores/ui-store'

const items: Array<{ id: SidebarPanel; icon: React.ReactNode; label: string }> = [
  { id: 'projects', icon: <FolderKanban size={22} />, label: 'Projects' },
  { id: 'files', icon: <Files size={22} />, label: 'Explorer' },
  { id: 'search', icon: <Search size={22} />, label: 'Search' },
  { id: 'git', icon: <GitBranch size={22} />, label: 'Source Control' },
  { id: 'settings', icon: <Settings size={22} />, label: 'Settings' }
]

export function ActivityBar() {
  const { activeSidebarPanel, sidebarVisible, setActiveSidebarPanel, terminalPanelVisible, toggleTerminalPanel, appMode, toggleAppMode } = useUiStore()

  return (
    <div
      className="flex flex-col items-center justify-between py-2 shrink-0"
      style={{
        width: 'var(--activity-bar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)'
      }}
    >
      <div className="flex flex-col items-center w-full">
        {items.map((item) => {
          const isActive = sidebarVisible && activeSidebarPanel === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveSidebarPanel(item.id)}
              title={item.label}
              className={cn(
                'flex items-center justify-center w-full h-12 transition-colors relative',
                isActive
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
              {item.icon}
            </button>
          )
        })}
      </div>
      <div className="flex flex-col items-center w-full">
        {appMode === 'editor' && (
          <button
            onClick={toggleTerminalPanel}
            title="Terminal"
            className={cn(
              'flex items-center justify-center w-full h-12 transition-colors relative',
              terminalPanelVisible
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            {terminalPanelVisible && (
              <div
                className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            )}
            <Terminal size={22} />
          </button>
        )}
        <button
          onClick={toggleAppMode}
          title={
            appMode === 'canvas' ? 'Canvas Mode (Active)' :
              appMode === 'editor' ? 'Editor Mode (Click for Zen)' :
                'Zen Mode (Click for Canvas)'
          }
          className={cn(
            'flex items-center justify-center w-full h-12 transition-colors relative',
            appMode === 'canvas'
              ? 'text-[var(--accent)]'
              : appMode === 'zen'
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          )}
        >
          {(appMode === 'canvas' || appMode === 'zen') && (
            <div
              className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          )}
          <LayoutGrid size={22} />
        </button>
      </div>
    </div>
  )
}
