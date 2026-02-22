import { useRef } from 'react'
import { TerminalInstance } from './TerminalInstance'
import { TerminalHeader } from './TerminalHeader'
import { ZenMonacoEditor } from './ZenMonacoEditor'
import { EditorPanelHeader } from './EditorPanelHeader'
import { useZenStore, type ZenPanel } from '../../stores/zen-store'
import type { Terminal } from '@xterm/xterm'

interface PanelRendererProps {
  panel: ZenPanel
  isActive: boolean
  onFocus: () => void
  onTermRef?: (ref: Terminal | null) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

export function PanelRenderer({
  panel,
  isActive,
  onFocus,
  onTermRef,
  draggable,
  onDragStart,
  onDragOver,
  onDrop
}: PanelRendererProps) {
  const termRefLocal = useRef<Terminal | null>(null)

  if (panel.type === 'terminal' && panel.terminalSessionId) {
    return (
      <>
        <TerminalHeader
          sessionId={panel.terminalSessionId}
          panelId={panel.id}
          title={panel.title}
          isActive={isActive}
          onFocus={onFocus}
          termRef={termRefLocal.current}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <TerminalInstance
            sessionId={panel.terminalSessionId}
            onTermRef={(ref) => {
              termRefLocal.current = ref
              onTermRef?.(ref)
            }}
          />
        </div>
      </>
    )
  }

  if (panel.type === 'editor' && panel.filePath) {
    return (
      <>
        <EditorPanelHeader
          panelId={panel.id}
          filePath={panel.filePath}
          title={panel.title}
          isDirty={panel.isDirty ?? false}
          isActive={isActive}
          onFocus={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <ZenMonacoEditor filePath={panel.filePath} panelId={panel.id} />
        </div>
      </>
    )
  }

  return null
}
