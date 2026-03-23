import { useState, useCallback } from 'react'
import { Folder } from 'lucide-react'

/** Generic project type presets (from Lite Suite icon library) */
export const GENERIC_PRESETS = [
  { id: 'code', label: 'Code' },
  { id: 'python', label: 'Python' },
  { id: 'rocket', label: 'Rocket' },
  { id: 'ai_brain', label: 'AI / ML' },
  { id: 'book', label: 'Docs' },
  { id: 'cog', label: 'Config' },
  { id: 'cpu', label: 'Systems' },
  { id: 'gpu', label: 'Graphics' },
  { id: 'secure', label: 'Security' },
  { id: 'edit_wand', label: 'Creative' },
  { id: 'ram', label: 'Performance' },
  { id: 'gift', label: 'Open Source' },
  { id: 'installer', label: 'Build' },
  { id: 'OS', label: 'Terminal OS' }
] as const

/** Lite Suite app icons (branded badges) */
export const LITE_SUITE_PRESETS = [
  { id: 'liteeditor', label: 'LiteEditor' },
  { id: 'liteterminal', label: 'LiteTerminal' },
  { id: 'litememory', label: 'LiteMemory' },
  { id: 'liteimage', label: 'LiteImage' },
  { id: 'litespeak', label: 'LiteSpeak' },
  { id: 'liteaisuite', label: 'LiteAISuite' },
  { id: 'litedash', label: 'LiteDash' },
  { id: 'litebench', label: 'LiteBench' },
  { id: 'litenotion', label: 'LiteNotion' },
  { id: 'litesnip', label: 'LiteSnip' },
  { id: 'liteusage', label: 'LiteUsage' },
  { id: 'liteyttranscribe', label: 'LiteYT' },
  { id: 'litewinterminal', label: 'LiteWinTerm' },
  { id: 'litemcp', label: 'LiteMCP' },
  { id: 'mcp0ne', label: 'MCP-0ne' }
] as const

/** All presets combined */
export const PROJECT_ICON_PRESETS = [...GENERIC_PRESETS, ...LITE_SUITE_PRESETS]

export type PresetIconId = typeof PROJECT_ICON_PRESETS[number]['id']

/** Resolves an icon value to an image src path */
function resolveIconSrc(icon: string): string | null {
  const isPreset = PROJECT_ICON_PRESETS.some((p) => p.id === icon)
  if (isPreset) {
    return `project-icons/${icon}.png`
  }
  // Custom path (absolute or relative)
  if (icon.includes('/') || icon.includes('\\')) {
    return icon
  }
  return null
}

interface ProjectIconProps {
  icon?: string
  size?: number
  className?: string
}

/** Displays a project icon — preset, custom image, or default folder */
export function ProjectIcon({ icon, size = 16, className }: ProjectIconProps) {
  const [imgError, setImgError] = useState(false)

  if (!icon || imgError) {
    return <Folder size={size} style={{ color: 'var(--text-muted)' }} className={className} />
  }

  const src = resolveIconSrc(icon)
  if (!src) {
    return <Folder size={size} style={{ color: 'var(--text-muted)' }} className={className} />
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', borderRadius: 3 }}
      onError={() => setImgError(true)}
      draggable={false}
    />
  )
}

interface ProjectIconPickerProps {
  currentIcon?: string
  onSelect: (icon: string) => void
  onClose: () => void
}

/** Grid picker for choosing a project icon */
export function ProjectIconPicker({ currentIcon, onSelect, onClose }: ProjectIconPickerProps) {
  const handleCustom = useCallback(async () => {
    try {
      const path = await window.api.dialog.openFile([
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'ico', 'webp'] }
      ])
      if (path) {
        onSelect(path)
        onClose()
      }
    } catch { /* cancelled */ }
  }, [onSelect, onClose])

  return (
    <div
      className="fixed z-50 rounded-lg shadow-2xl p-3"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        width: 300
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Generic presets */}
      <div className="text-[9px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Project Type
      </div>
      <div className="grid grid-cols-7 gap-1 mb-3">
        {GENERIC_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => { onSelect(preset.id); onClose() }}
            className="flex items-center justify-center p-1 rounded transition-all hover:scale-110"
            style={{
              backgroundColor: currentIcon === preset.id ? 'var(--bg-overlay)' : 'transparent',
              border: currentIcon === preset.id ? '1px solid var(--accent)' : '1px solid transparent'
            }}
            title={preset.label}
          >
            <img
              src={`project-icons/${preset.id}.png`}
              alt={preset.label}
              width={28}
              height={28}
              style={{ objectFit: 'contain' }}
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Lite Suite app icons */}
      <div className="text-[9px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Lite Suite
      </div>
      <div className="grid grid-cols-5 gap-1 mb-3">
        {LITE_SUITE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => { onSelect(preset.id); onClose() }}
            className="flex flex-col items-center gap-0.5 p-1 rounded transition-all hover:scale-105"
            style={{
              backgroundColor: currentIcon === preset.id ? 'var(--bg-overlay)' : 'transparent',
              border: currentIcon === preset.id ? '1px solid var(--accent)' : '1px solid transparent'
            }}
            title={preset.label}
          >
            <img
              src={`project-icons/${preset.id}.png`}
              alt={preset.label}
              width={32}
              height={32}
              style={{ objectFit: 'contain', borderRadius: 4 }}
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-1 pt-1.5" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleCustom}
          className="flex-1 text-[9px] py-1 rounded transition-colors hover:bg-[var(--bg-overlay)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Custom Image...
        </button>
        <button
          onClick={() => { onSelect(''); onClose() }}
          className="text-[9px] py-1 px-2 rounded transition-colors hover:bg-[var(--bg-overlay)]"
          style={{ color: 'var(--text-muted)' }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
