import React from 'react'
import { Files, Search, GitBranch, Settings, Terminal, LayoutGrid, FolderKanban } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useUiStore, type SidebarPanel } from '../../stores/ui-store'

const items: Array<{ id: SidebarPanel; icon: React.ReactNode; label: string }> = [
  { id: 'projects', icon: <FolderKanban size={22} />, label: 'Projects' },
  { id: 'files', icon: <Files size={22} />, label: 'Explorer' },
  { id: 'search', icon: <Search size={22} />, label: 'Search' },
  { id: 'git', icon: <GitBranch size={22} />, label: 'Source Control' }
]

export function ActivityBar() {
  const { activeSidebarPanel, sidebarVisible, setActiveSidebarPanel, terminalPanelVisible, toggleTerminalPanel, settingsPanelVisible, toggleSettingsPanel, appMode, toggleAppMode } = useUiStore()

  return (
    <div
      className="flex flex-col items-center justify-between py-3 shrink-0 relative z-10 rounded-xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5"
      style={{
        width: 'var(--activity-bar-width)',
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
                'flex items-center justify-center w-10 h-10 mb-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 relative group cursor-pointer',
                isActive
                  ? 'bg-[var(--bg-overlay)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'
              )}
            >
              {isActive && (
                <div
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full transition-all duration-300 shadow-[0_0_8px_var(--accent)]"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
              <div className={cn("transition-transform duration-300", isActive ? "scale-110 text-[var(--accent)]" : "")}>
                {item.icon}
              </div>
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
              'flex items-center justify-center w-10 h-10 mb-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 relative group cursor-pointer',
              terminalPanelVisible
                ? 'bg-[var(--bg-overlay)] text-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'
            )}
          >
            {terminalPanelVisible && (
              <div
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full transition-all duration-300 shadow-[0_0_8px_var(--accent)]"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            )}
            <div className={cn("transition-transform duration-300", terminalPanelVisible ? "scale-110 text-[var(--accent)]" : "")}>
              <Terminal size={22} />
            </div>
          </button>
        )}
        <button
          onClick={toggleSettingsPanel}
          title="Settings"
          className={cn(
            'flex items-center justify-center w-10 h-10 mb-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 relative group cursor-pointer',
            settingsPanelVisible
              ? 'bg-[var(--bg-overlay)] text-[var(--accent)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'
          )}
        >
          {settingsPanelVisible && (
            <div
              className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full transition-all duration-300 shadow-[0_0_8px_var(--accent)]"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          )}
          <div className={cn("transition-transform duration-300", settingsPanelVisible ? "scale-110 rotate-45 text-[var(--accent)]" : "group-hover:rotate-90")}>
            <Settings size={22} />
          </div>
        </button>
        <button
          onClick={toggleAppMode}
          title={
            appMode === 'canvas' ? 'Canvas Mode (Active)' :
              appMode === 'editor' ? 'Editor Mode (Click for Zen)' :
                'Zen Mode (Click for Canvas)'
          }
          className={cn(
            'flex items-center justify-center w-10 h-10 mb-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 relative group cursor-pointer',
            appMode === 'canvas'
              ? 'text-[var(--accent)] bg-[var(--bg-overlay)]/30'
              : appMode === 'zen'
                ? 'text-[var(--text-primary)] bg-[var(--bg-overlay)]/30'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'
          )}
        >
          {(appMode === 'canvas' || appMode === 'zen') && (
            <div
              className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full transition-all duration-300 shadow-[0_0_8px_var(--accent)]"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          )}
          <div className={cn("transition-transform duration-300", appMode !== 'editor' ? "scale-110" : "")}>
            <LayoutGrid size={22} />
          </div>
        </button>
      </div>
    </div>
  )
}
